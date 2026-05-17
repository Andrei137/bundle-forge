package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.CartItemDto;
import com.unibuc.bundle_forge.dto.CreatePaymentRequestDto;
import com.unibuc.bundle_forge.dto.OrderDto;
import com.unibuc.bundle_forge.dto.OrderItemDto;
import com.unibuc.bundle_forge.dto.PaymentResponseDto;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.model.Coupon;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.model.GameKey;
import com.unibuc.bundle_forge.model.Payment;
import com.unibuc.bundle_forge.model.PaymentItem;
import com.unibuc.bundle_forge.model.Transaction;
import com.unibuc.bundle_forge.repository.CouponRepository;
import com.unibuc.bundle_forge.repository.CustomerRepository;
import com.unibuc.bundle_forge.repository.GameKeyRepository;
import com.unibuc.bundle_forge.repository.GameRepository;
import com.unibuc.bundle_forge.repository.PaymentRepository;
import com.unibuc.bundle_forge.repository.TransactionRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.RequestOptions;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripePaymentService {

    private static final String GATEWAY = "STRIPE";

    private final PaymentRepository paymentRepository;
    private final TransactionRepository transactionRepository;
    private final GameRepository gameRepository;
    private final GameKeyRepository gameKeyRepository;
    private final CustomerRepository customerRepository;
    private final CouponRepository couponRepository;
    private final IdempotencyService idempotencyService;
    private final JwtService jwtService;
    private final PaymentSaveHelper paymentSaveHelper;

    @Value("${stripe.api-key:}")
    private String stripeApiKey;

    @Value("${stripe.webhook-secret:}")
    private String stripeWebhookSecret;

    @PostConstruct
    void init() {
        if (stripeApiKey != null && !stripeApiKey.isBlank()) {
            Stripe.apiKey = stripeApiKey;
        }
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PaymentResponseDto createPayment(CreatePaymentRequestDto request, String idempotencyKey) {
        Customer customer = jwtService.getCurrentCustomer();
        if (customer == null) throw new ValidationException("Only customers can purchase games");

        String intentKey = (idempotencyKey != null && !idempotencyKey.isBlank())
                ? idempotencyKey + "-intent"
                : UUID.randomUUID().toString() + "-intent";

        PaymentResponseDto cached = idempotencyService.get(intentKey);
        if (cached != null) return cached;

        Optional<Payment> existingOpt = paymentRepository.findByUuid(intentKey);
        if (existingOpt.isPresent()) {
            Payment existing = existingOpt.get();
            PaymentResponseDto response = toResponse(existing, "Payment already exists for idempotency key");
            idempotencyService.store(intentKey, response);
            return response;
        }

        Map<Integer, Integer> aggregated = aggregate(request.getItems());
        List<Game> games = loadAndValidateGames(aggregated);

        long total = 0L;
        List<PaymentItem> items = new ArrayList<>();
        String description = buildDescription(games, aggregated);
        for (Game game : games) {
            int quantity = aggregated.get(game.getId());
            long unit = priceCents(game);
            total += unit * quantity;
            items.add(PaymentItem.builder()
                    .game(game)
                    .quantity(quantity)
                    .unitAmount(unit)
                    .build());
        }

        String couponCode = null;
        long couponDiscount = 0L;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            Coupon coupon = couponRepository.findById(request.getCouponCode())
                    .orElseThrow(() -> new ValidationException("Coupon not found"));
            if (coupon.getStatus() != Coupon.Status.ACTIVE ||
                    (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(java.time.LocalDate.now()))) {
                throw new ValidationException("Coupon is not valid");
            }
            couponCode = coupon.getCode();
            if (coupon.getType() == Coupon.Type.PERCENTAGE) {
                couponDiscount = Math.round(total * coupon.getValue().doubleValue() / 100.0);
            } else {
                couponDiscount = Math.round(coupon.getValue().doubleValue() * 100);
            }
            couponDiscount = Math.min(couponDiscount, total);
        }
        long finalTotal = total - couponDiscount;

        Payment payment = Payment.builder()
                .uuid(intentKey)
                .customer(customer)
                .amount(finalTotal)
                .currency("ron")
                .description(description)
                .status(Payment.Status.CREATED)
                .couponCode(couponCode)
                .couponDiscount(couponDiscount)
                .build();
        for (PaymentItem it : items) it.setPayment(payment);
        payment.setItems(items);

        try {
            paymentSaveHelper.save(payment);
            // Reload into the outer READ_COMMITTED session so the entity is managed.
            // READ_COMMITTED sees each SELECT fresh, so it finds the just-committed row.
            payment = paymentRepository.findByUuid(intentKey).orElseThrow();
        } catch (DataIntegrityViolationException dive) {
            // The outer session's REPEATABLE_READ snapshot cannot see the
            // concurrent insert that caused the duplicate key, so we query
            // in a fresh READ_COMMITTED transaction via the helper.
            return paymentSaveHelper.findByUuid(intentKey)
                    .map(existing -> toResponse(existing, "Payment already exists for idempotency key"))
                    .orElseThrow(() -> new RuntimeException("Failed to create or load payment after race"));
        }

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(finalTotal)
                .setCurrency("ron")
                .setDescription(description)
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build())
                .putMetadata("paymentUuid", intentKey)
                .putMetadata("paymentId", String.valueOf(payment.getId()))
                .putMetadata("customerId", String.valueOf(customer.getId()))
                .build();

        RequestOptions opts = RequestOptions.builder()
                .setIdempotencyKey(intentKey)
                .build();

        try {
            PaymentIntent intent = PaymentIntent.create(params, opts);

            payment.setClientSecret(intent.getClientSecret());
            paymentRepository.save(payment);

            Transaction tx = Transaction.builder()
                    .uuid(UUID.randomUUID().toString())
                    .gatewayTransactionId(intent.getId())
                    .gateway(GATEWAY)
                    .status(intent.getStatus())
                    .payment(payment)
                    .build();
            transactionRepository.save(tx);

            PaymentResponseDto response = PaymentResponseDto.builder()
                    .success(true)
                    .paymentId(payment.getId())
                    .paymentUuid(payment.getUuid())
                    .clientSecret(intent.getClientSecret())
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .status(payment.getStatus().name())
                    .message("PaymentIntent created")
                    .build();
            idempotencyService.store(intentKey, response);
            return response;

        } catch (StripeException e) {
            payment.setStatus(Payment.Status.PAYMENT_FAILED);
            paymentRepository.save(payment);
            log.error("Stripe error creating PaymentIntent", e);
            return PaymentResponseDto.builder()
                    .success(false)
                    .paymentId(payment.getId())
                    .paymentUuid(payment.getUuid())
                    .status(payment.getStatus().name())
                    .message("Stripe error: " + e.getMessage())
                    .build();
        }
    }

    @Transactional
    public void handleWebhook(String sigHeader, String payload) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);
        } catch (SignatureVerificationException e) {
            throw new ValidationException("Invalid Stripe signature");
        }

        log.info("Received Stripe event {} of type {}", event.getId(), event.getType());

        switch (event.getType()) {
            case "payment_intent.succeeded" -> handlePaymentIntentSucceeded(event);
            case "payment_intent.payment_failed" -> handlePaymentIntentFailed(event);
            default -> log.debug("Ignoring Stripe event type {}", event.getType());
        }
    }

    void handlePaymentIntentSucceeded(Event event) {
        PaymentIntent intent = extractPaymentIntent(event);
        if (intent == null) return;

        Transaction tx = transactionRepository.findByGatewayTransactionId(intent.getId()).orElse(null);
        if (tx == null) {
            log.warn("No transaction found for Stripe payment intent {}", intent.getId());
            return;
        }
        Payment payment = tx.getPayment();
        if (payment.getStatus() == Payment.Status.PAYMENT_SUCCEEDED) {
            log.info("Payment {} already succeeded, ignoring duplicate webhook", payment.getId());
            return;
        }

        tx.setStatus("SUCCEEDED");
        transactionRepository.save(tx);

        Customer customer = payment.getCustomer();
        for (PaymentItem item : payment.getItems()) {
            Optional<GameKey> keyOpt = gameKeyRepository.lockNextActiveKey(item.getGame().getId());
            if (keyOpt.isEmpty()) {
                log.error("No active GameKey available for game {} on payment {}",
                        item.getGame().getId(), payment.getId());
                continue;
            }
            GameKey key = keyOpt.get();
            key.setStatus(GameKey.Status.USED);
            gameKeyRepository.save(key);
            item.setAssignedKey(key);

            if (!customer.getOwnedGames().contains(item.getGame())) {
                customer.getOwnedGames().add(item.getGame());
            }
            Game game = item.getGame();
            game.setSalesCount(game.getSalesCount() + 1);
            gameRepository.save(game);
        }
        customerRepository.save(customer);

        if (payment.getCouponCode() != null) {
            couponRepository.findById(payment.getCouponCode()).ifPresent(c -> {
                c.setStatus(Coupon.Status.USED);
                couponRepository.save(c);
            });
        }

        payment.setStatus(Payment.Status.PAYMENT_SUCCEEDED);
        paymentRepository.save(payment);
    }

    void handlePaymentIntentFailed(Event event) {
        PaymentIntent intent = extractPaymentIntent(event);
        if (intent == null) return;

        Transaction tx = transactionRepository.findByGatewayTransactionId(intent.getId()).orElse(null);
        if (tx == null) return;
        tx.setStatus("FAILED");
        transactionRepository.save(tx);

        Payment payment = tx.getPayment();
        payment.setStatus(Payment.Status.PAYMENT_FAILED);
        paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> listMyOrders() {
        Customer customer = jwtService.getCurrentCustomer();
        if (customer == null) throw new ValidationException("Only customers can view orders");
        return paymentRepository.findAllByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(this::toOrderDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderDto getMyOrder(Long paymentId) {
        Customer customer = jwtService.getCurrentCustomer();
        if (customer == null) throw new ValidationException("Only customers can view orders");
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        if (!payment.getCustomer().getId().equals(customer.getId())) {
            throw new NotFoundException("Order not found");
        }
        return toOrderDto(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponseDto getStatus(String paymentUuid) {
        Customer customer = jwtService.getCurrentCustomer();
        Payment payment = paymentRepository.findByUuid(paymentUuid)
                .orElseThrow(() -> new NotFoundException("Payment not found"));
        if (customer == null || !payment.getCustomer().getId().equals(customer.getId())) {
            throw new NotFoundException("Payment not found");
        }
        return toResponse(payment, "OK");
    }

    private PaymentResponseDto toResponse(Payment payment, String message) {
        return PaymentResponseDto.builder()
                .success(true)
                .paymentId(payment.getId())
                .paymentUuid(payment.getUuid())
                .clientSecret(payment.getClientSecret())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus().name())
                .message(message)
                .build();
    }

    private OrderDto toOrderDto(Payment payment) {
        List<OrderItemDto> items = payment.getItems().stream()
                .map(it -> OrderItemDto.builder()
                        .gameId(it.getGame().getId())
                        .title(it.getGame().getTitle())
                        .cover(it.getGame().getCover())
                        .unitAmount(it.getUnitAmount())
                        .quantity(it.getQuantity())
                        .gameKey(it.getAssignedKey() != null ? it.getAssignedKey().getId() : null)
                        .build())
                .toList();
        return OrderDto.builder()
                .id(payment.getId())
                .uuid(payment.getUuid())
                .createdAt(payment.getCreatedAt())
                .status(payment.getStatus().name())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .items(items)
                .build();
    }

    private PaymentIntent extractPaymentIntent(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        Optional<StripeObject> opt = deserializer.getObject();
        if (opt.isPresent() && opt.get() instanceof PaymentIntent intent) {
            return intent;
        }
        log.warn("Could not deserialize PaymentIntent from event {} (API version mismatch?)", event.getId());
        return null;
    }

    private Map<Integer, Integer> aggregate(List<CartItemDto> items) {
        Map<Integer, Integer> map = new LinkedHashMap<>();
        for (CartItemDto item : items) {
            map.merge(item.getGameId(), item.getQuantity(), Integer::sum);
        }
        return map;
    }

    private List<Game> loadAndValidateGames(Map<Integer, Integer> aggregated) {
        List<Game> games = gameRepository.findAllById(aggregated.keySet());
        if (games.size() != aggregated.size()) {
            throw new ValidationException("One or more games could not be found");
        }
        for (Game game : games) {
            if (game.getStatus() != Game.Status.PUBLISHED) {
                throw new ValidationException("Game \"" + game.getTitle() + "\" is not available");
            }
            int qty = aggregated.get(game.getId());
            long active = gameKeyRepository.countByGameIdAndStatus(game.getId(), GameKey.Status.ACTIVE);
            if (active < qty) {
                throw new ValidationException("Not enough keys available for \"" + game.getTitle() + "\"");
            }
        }
        games.sort(Comparator.comparing(Game::getId));
        return games;
    }

    private long priceCents(Game game) {
        double effective = game.getPrice();
        if (game.getDiscountPercentage() != null && game.getDiscountPercentage() > 0) {
            effective = effective * (100 - game.getDiscountPercentage()) / 100.0;
        }
        return Math.round(effective * 100);
    }

    private String buildDescription(List<Game> games, Map<Integer, Integer> aggregated) {
        if (games.size() == 1) {
            Game g = games.get(0);
            int qty = aggregated.get(g.getId());
            return qty > 1 ? g.getTitle() + " x" + qty : g.getTitle();
        }
        return "Bundle Forge order (" + games.size() + " items)";
    }
}
