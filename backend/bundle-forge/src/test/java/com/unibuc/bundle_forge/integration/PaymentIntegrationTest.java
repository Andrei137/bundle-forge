package com.unibuc.bundle_forge.integration;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.RequestOptions;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.unibuc.bundle_forge.dto.CartItemDto;
import com.unibuc.bundle_forge.dto.CreatePaymentRequestDto;
import com.unibuc.bundle_forge.model.Bundle;
import com.unibuc.bundle_forge.model.BundleTier;
import com.unibuc.bundle_forge.model.Coupon;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.model.GameKey;
import com.unibuc.bundle_forge.model.Payment;
import com.unibuc.bundle_forge.model.PaymentItem;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.model.Transaction;
import com.unibuc.bundle_forge.model.Website;
import com.unibuc.bundle_forge.repository.BundleRepository;
import com.unibuc.bundle_forge.repository.CouponRepository;
import com.unibuc.bundle_forge.repository.CustomerRepository;
import com.unibuc.bundle_forge.repository.DeveloperRepository;
import com.unibuc.bundle_forge.repository.GameKeyRepository;
import com.unibuc.bundle_forge.repository.GameRepository;
import com.unibuc.bundle_forge.repository.PaymentRepository;
import com.unibuc.bundle_forge.repository.TransactionRepository;
import com.unibuc.bundle_forge.repository.UserRepository;
import com.unibuc.bundle_forge.service.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Import(IntegrationTestConfig.class)
@ActiveProfiles("test")
class PaymentIntegrationTest {

    @Autowired private WebApplicationContext context;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JwtService jwtService;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private DeveloperRepository developerRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private GameRepository gameRepository;
    @Autowired private GameKeyRepository gameKeyRepository;
    @Autowired private BundleRepository bundleRepository;
    @Autowired private CouponRepository couponRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private TransactionTemplate txTemplate;

    private MockMvc mockMvc;
    private Customer customer;
    private Customer otherCustomer;
    private Developer developer;
    private Game publishedGame;
    private Game announcedGame;
    private Game bundleGameA;
    private Game bundleGameB;
    private Game bundleGameC;
    private Bundle bundle;
    private String customerToken;
    private String otherCustomerToken;
    private String developerToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        cleanDb();

        developer = developerRepository.save(Developer.builder()
                .email("dev@test.com")
                .password(JwtService.encryptPassword("Secret__123"))
                .displayName("Dev One")
                .website(Website.builder().url("https://dev.test").build())
                .status(Provider.Status.ACCEPTED)
                .build());
        developerToken = jwtService.getToken(String.valueOf(developer.getId()));

        customer = customerRepository.save(Customer.builder()
                .email("buyer@test.com")
                .password(JwtService.encryptPassword("Secret__123"))
                .firstName("Buy").lastName("Er").phoneNumber("0700000001")
                .ownedGames(new ArrayList<>())
                .build());
        customerToken = jwtService.getToken(String.valueOf(customer.getId()));

        otherCustomer = customerRepository.save(Customer.builder()
                .email("other@test.com")
                .password(JwtService.encryptPassword("Secret__123"))
                .firstName("Oth").lastName("Er").phoneNumber("0700000002")
                .ownedGames(new ArrayList<>())
                .build());
        otherCustomerToken = jwtService.getToken(String.valueOf(otherCustomer.getId()));

        publishedGame = saveGame("Solo Game", 50.0, 0, Game.Status.PUBLISHED);
        announcedGame = saveGame("Upcoming", 30.0, 0, Game.Status.ANNOUNCED);
        bundleGameA = saveGame("Bundle Game A", 100.0, 0, Game.Status.PUBLISHED);
        bundleGameB = saveGame("Bundle Game B", 100.0, 0, Game.Status.PUBLISHED);
        bundleGameC = saveGame("Bundle Game C", 100.0, 0, Game.Status.PUBLISHED);

        addKeys(publishedGame, 2);
        addKeys(bundleGameA, 1);
        addKeys(bundleGameB, 1);
        addKeys(bundleGameC, 1);

        bundle = bundleRepository.save(Bundle.builder()
                .title("Mega Bundle")
                .cover("cover.jpg")
                .shortDescription("short")
                .longDescription("long")
                .platformMinPct(10)
                .devMinPct(50)
                .games(new ArrayList<>(List.of(bundleGameA, bundleGameB, bundleGameC)))
                .tiers(new ArrayList<>(List.of(
                        BundleTier.builder().numRequiredGames(3).pricePerGame(10.0).build(),
                        BundleTier.builder().numRequiredGames(5).pricePerGame(8.0).build()
                )))
                .daysLeft(30)
                .build());
    }

    @AfterEach
    void tearDown() {
        cleanDb();
    }

    private void cleanDb() {
        // Truncate join tables first so deleting parent rows doesn't trip
        // Hibernate's "transient instance" checks against in-memory references.
        jdbcTemplate.execute("DELETE FROM library");
        jdbcTemplate.execute("DELETE FROM bundle_games");
        jdbcTemplate.execute("DELETE FROM bundle_tiers");
        jdbcTemplate.execute("DELETE FROM game_tags");
        transactionRepository.deleteAll();
        paymentRepository.deleteAll();
        gameKeyRepository.deleteAll();
        couponRepository.deleteAll();
        bundleRepository.deleteAll();
        gameRepository.deleteAll();
        customerRepository.deleteAll();
        developerRepository.deleteAll();
        userRepository.deleteAll();
    }

    private Game saveGame(String title, double price, int discount, Game.Status status) {
        return gameRepository.save(Game.builder()
                .title(title)
                .shortDescription("s")
                .longDescription("l")
                .languages(new ArrayList<>(List.of("en")))
                .price(price)
                .discountPercentage(discount)
                .cover("cover.jpg")
                .status(status)
                .developer(developer)
                .build());
    }

    private void addKeys(Game game, int count) {
        for (int i = 0; i < count; i++) {
            gameKeyRepository.save(GameKey.builder()
                    .id(game.getTitle().replace(" ", "_") + "_KEY_" + i + "_" + UUID.randomUUID())
                    .game(game)
                    .status(GameKey.Status.ACTIVE)
                    .build());
        }
    }

    private String json(Object o) throws Exception {
        return objectMapper.writeValueAsString(o);
    }

    private CartItemDto cartItem(Integer gameId, int quantity) {
        return CartItemDto.builder().gameId(gameId).quantity(quantity).build();
    }

    private CartItemDto bundleItem(Integer gameId, Integer bundleId, Integer platform, Integer dev, long unitCents) {
        return CartItemDto.builder()
                .gameId(gameId).quantity(1)
                .bundleId(bundleId).platformPct(platform).devPct(dev)
                .unitAmount(unitCents)
                .build();
    }

    private PaymentIntent newMockIntent() {
        PaymentIntent intent = mock(PaymentIntent.class);
        String id = "pi_test_" + UUID.randomUUID().toString().replace("-", "");
        when(intent.getId()).thenReturn(id);
        when(intent.getClientSecret()).thenReturn(id + "_secret_test");
        when(intent.getStatus()).thenReturn("requires_payment_method");
        return intent;
    }

    // ────────────────────── Auth & role ──────────────────────

    @Test
    void create_withoutAuth_returns401() throws Exception {
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(cartItem(publishedGame.getId(), 1))).build();
        mockMvc.perform(post("/payment/create")
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void create_asDeveloper_returns401() throws Exception {
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(cartItem(publishedGame.getId(), 1))).build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + developerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void status_withoutAuth_returns401() throws Exception {
        mockMvc.perform(get("/payment/status/anything"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void orders_list_withoutAuth_returns401() throws Exception {
        mockMvc.perform(get("/payment/orders"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void orders_get_withoutAuth_returns401() throws Exception {
        mockMvc.perform(get("/payment/orders/1"))
                .andExpect(status().isUnauthorized());
    }

    // ────────────────────── Request validation ──────────────────────

    @Test
    void create_emptyItems_returns400() throws Exception {
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder().items(List.of()).build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_missingItems_returns400() throws Exception {
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_quantityZero_returns400() throws Exception {
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(cartItem(publishedGame.getId(), 0))).build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    // ────────────────────── Game validation ──────────────────────

    @Test
    void create_unknownGame_returns400() throws Exception {
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(cartItem(999_999, 1))).build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_announcedGame_returns400() throws Exception {
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(cartItem(announcedGame.getId(), 1))).build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_notEnoughKeys_returns400() throws Exception {
        // publishedGame has 2 active keys; ask for 5
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(cartItem(publishedGame.getId(), 5))).build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    // ────────────────────── Coupon validation ──────────────────────

    @Test
    void create_unknownCoupon_returns400() throws Exception {
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(cartItem(publishedGame.getId(), 1)))
                .couponCode("NOPE").build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_expiredCoupon_returns400() throws Exception {
        couponRepository.save(Coupon.builder()
                .code("EXPIRED").name("expired").type(Coupon.Type.PERCENTAGE)
                .value(BigDecimal.valueOf(10)).status(Coupon.Status.ACTIVE)
                .expirationDate(LocalDate.now().minusDays(1)).build());

        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(cartItem(publishedGame.getId(), 1)))
                .couponCode("EXPIRED").build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_inactiveCoupon_returns400() throws Exception {
        couponRepository.save(Coupon.builder()
                .code("USED").name("used").type(Coupon.Type.PERCENTAGE)
                .value(BigDecimal.valueOf(10)).status(Coupon.Status.USED).build());

        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(cartItem(publishedGame.getId(), 1)))
                .couponCode("USED").build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    // ────────────────────── Bundle validation ──────────────────────

    @Test
    void create_bundleItem_missingSplit_returns400() throws Exception {
        // bundleId set but no platformPct/devPct
        CartItemDto badItem = CartItemDto.builder()
                .gameId(bundleGameA.getId()).quantity(1).bundleId(bundle.getId())
                .unitAmount(1000L).build();
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(badItem,
                        bundleItem(bundleGameB.getId(), bundle.getId(), 10, 50, 1000),
                        bundleItem(bundleGameC.getId(), bundle.getId(), 10, 50, 1000)))
                .build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_bundleItem_missingUnitAmount_returns400() throws Exception {
        CartItemDto badItem = CartItemDto.builder()
                .gameId(bundleGameA.getId()).quantity(1).bundleId(bundle.getId())
                .platformPct(10).devPct(50).build();
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(badItem,
                        bundleItem(bundleGameB.getId(), bundle.getId(), 10, 50, 1000),
                        bundleItem(bundleGameC.getId(), bundle.getId(), 10, 50, 1000)))
                .build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_bundleItem_zeroUnitAmount_returns400() throws Exception {
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(
                        bundleItem(bundleGameA.getId(), bundle.getId(), 10, 50, 0),
                        bundleItem(bundleGameB.getId(), bundle.getId(), 10, 50, 1000),
                        bundleItem(bundleGameC.getId(), bundle.getId(), 10, 50, 1000)))
                .build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_bundle_inconsistentSplit_returns400() throws Exception {
        // same bundleId, different platformPct
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(
                        bundleItem(bundleGameA.getId(), bundle.getId(), 10, 50, 1000),
                        bundleItem(bundleGameB.getId(), bundle.getId(), 20, 50, 1000),
                        bundleItem(bundleGameC.getId(), bundle.getId(), 10, 50, 1000)))
                .build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_bundle_platformBelowMin_returns400() throws Exception {
        // bundle has platformMinPct=10
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(
                        bundleItem(bundleGameA.getId(), bundle.getId(), 5, 50, 1000),
                        bundleItem(bundleGameB.getId(), bundle.getId(), 5, 50, 1000),
                        bundleItem(bundleGameC.getId(), bundle.getId(), 5, 50, 1000)))
                .build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_bundle_devBelowMin_returns400() throws Exception {
        // bundle has devMinPct=50
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(
                        bundleItem(bundleGameA.getId(), bundle.getId(), 10, 30, 1000),
                        bundleItem(bundleGameB.getId(), bundle.getId(), 10, 30, 1000),
                        bundleItem(bundleGameC.getId(), bundle.getId(), 10, 30, 1000)))
                .build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_bundle_splitOverHundred_returns400() throws Exception {
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(
                        bundleItem(bundleGameA.getId(), bundle.getId(), 60, 60, 1000),
                        bundleItem(bundleGameB.getId(), bundle.getId(), 60, 60, 1000),
                        bundleItem(bundleGameC.getId(), bundle.getId(), 60, 60, 1000)))
                .build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_bundle_belowSmallestTier_returns400() throws Exception {
        // smallest tier requires 3 games; send 2
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(
                        bundleItem(bundleGameA.getId(), bundle.getId(), 10, 50, 1000),
                        bundleItem(bundleGameB.getId(), bundle.getId(), 10, 50, 1000)))
                .build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_bundle_totalBelowTierMinimum_returns400() throws Exception {
        // 3 games at tier price 10.00 = 3000 cents; send 100 cents each = 300 total
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(
                        bundleItem(bundleGameA.getId(), bundle.getId(), 10, 50, 100),
                        bundleItem(bundleGameB.getId(), bundle.getId(), 10, 50, 100),
                        bundleItem(bundleGameC.getId(), bundle.getId(), 10, 50, 100)))
                .build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_bundle_unknownBundleId_returns400() throws Exception {
        CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                .items(List.of(
                        bundleItem(bundleGameA.getId(), 999_999, 10, 50, 1000),
                        bundleItem(bundleGameB.getId(), 999_999, 10, 50, 1000),
                        bundleItem(bundleGameC.getId(), 999_999, 10, 50, 1000)))
                .build();
        mockMvc.perform(post("/payment/create")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                .andExpect(status().isBadRequest());
    }

    // ────────────────────── Successful flow (Stripe mocked) ──────────────────────

    @Test
    void create_standalone_returns200_andPersistsPayment() throws Exception {
        try (MockedStatic<PaymentIntent> piStatic = mockStatic(PaymentIntent.class)) {
            PaymentIntent intent = newMockIntent();
            piStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class), any(RequestOptions.class)))
                    .thenReturn(intent);

            CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                    .items(List.of(cartItem(publishedGame.getId(), 1))).build();
            mockMvc.perform(post("/payment/create")
                            .header("Authorization", "Bearer " + customerToken)
                            .header("Idempotency-Key", "key-standalone")
                            .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.paymentUuid").value("key-standalone-intent"))
                    .andExpect(jsonPath("$.clientSecret").value(intent.getClientSecret()))
                    .andExpect(jsonPath("$.amount").value(5000))
                    .andExpect(jsonPath("$.currency").value("ron"));

            txTemplate.executeWithoutResult(s -> {
                Payment saved = paymentRepository.findByUuid("key-standalone-intent").orElseThrow();
                assertThat(saved.getStatus()).isEqualTo(Payment.Status.CREATED);
                assertThat(saved.getAmount()).isEqualTo(5000);
                assertThat(saved.getItems()).hasSize(1);
                PaymentItem item = saved.getItems().get(0);
                assertThat(item.getBundleId()).isNull();
                assertThat(item.getUnitAmount()).isEqualTo(5000);
            });
        }
    }

    @Test
    void create_bundle_returns200_andPersistsBundleFields() throws Exception {
        try (MockedStatic<PaymentIntent> piStatic = mockStatic(PaymentIntent.class)) {
            PaymentIntent intent = newMockIntent();
            piStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class), any(RequestOptions.class)))
                    .thenReturn(intent);

            // 3 games at 10.00 each = 3000 cents minimum. Customer pays 4500 (1500 cents per game = 15.00)
            CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                    .items(List.of(
                            bundleItem(bundleGameA.getId(), bundle.getId(), 15, 60, 1500),
                            bundleItem(bundleGameB.getId(), bundle.getId(), 15, 60, 1500),
                            bundleItem(bundleGameC.getId(), bundle.getId(), 15, 60, 1500)))
                    .build();
            mockMvc.perform(post("/payment/create")
                            .header("Authorization", "Bearer " + customerToken)
                            .header("Idempotency-Key", "key-bundle")
                            .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.amount").value(4500));

            txTemplate.executeWithoutResult(s -> {
                Payment saved = paymentRepository.findByUuid("key-bundle-intent").orElseThrow();
                assertThat(saved.getItems()).hasSize(3);
                saved.getItems().forEach(it -> {
                    assertThat(it.getBundleId()).isEqualTo(bundle.getId());
                    assertThat(it.getPlatformPct()).isEqualTo(15);
                    assertThat(it.getDevPct()).isEqualTo(60);
                    assertThat(it.getCharityPct()).isEqualTo(25);
                    assertThat(it.getUnitAmount()).isEqualTo(1500);
                });
            });
        }
    }

    @Test
    void create_withPercentCoupon_appliesDiscount() throws Exception {
        couponRepository.save(Coupon.builder()
                .code("SAVE20").name("save").type(Coupon.Type.PERCENTAGE)
                .value(BigDecimal.valueOf(20)).status(Coupon.Status.ACTIVE).build());

        try (MockedStatic<PaymentIntent> piStatic = mockStatic(PaymentIntent.class)) {
            PaymentIntent intent = newMockIntent();
            piStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class), any(RequestOptions.class)))
                    .thenReturn(intent);

            CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                    .items(List.of(cartItem(publishedGame.getId(), 1)))
                    .couponCode("SAVE20").build();
            mockMvc.perform(post("/payment/create")
                            .header("Authorization", "Bearer " + customerToken)
                            .header("Idempotency-Key", "key-coupon")
                            .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                    .andExpect(status().isOk())
                    // 5000 cents - 20% = 4000
                    .andExpect(jsonPath("$.amount").value(4000));

            Payment saved = paymentRepository.findByUuid("key-coupon-intent").orElseThrow();
            assertThat(saved.getCouponCode()).isEqualTo("SAVE20");
            assertThat(saved.getCouponDiscount()).isEqualTo(1000);
        }
    }

    @Test
    void create_sameKey_returnsCachedPayment() throws Exception {
        try (MockedStatic<PaymentIntent> piStatic = mockStatic(PaymentIntent.class)) {
            PaymentIntent intent = newMockIntent();
            piStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class), any(RequestOptions.class)))
                    .thenReturn(intent);

            CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                    .items(List.of(cartItem(publishedGame.getId(), 1))).build();
            // first call
            mockMvc.perform(post("/payment/create")
                            .header("Authorization", "Bearer " + customerToken)
                            .header("Idempotency-Key", "dup-key")
                            .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                    .andExpect(status().isOk());
            // second call with same key — must not create a second row
            mockMvc.perform(post("/payment/create")
                            .header("Authorization", "Bearer " + customerToken)
                            .header("Idempotency-Key", "dup-key")
                            .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.paymentUuid").value("dup-key-intent"));

            assertThat(paymentRepository.findAll()).hasSize(1);
        }
    }

    @Test
    void create_stripeException_marksPaymentFailed() throws Exception {
        try (MockedStatic<PaymentIntent> piStatic = mockStatic(PaymentIntent.class)) {
            StripeException ex = mock(StripeException.class);
            when(ex.getMessage()).thenReturn("stripe is sad");
            piStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class), any(RequestOptions.class)))
                    .thenThrow(ex);

            CreatePaymentRequestDto req = CreatePaymentRequestDto.builder()
                    .items(List.of(cartItem(publishedGame.getId(), 1))).build();
            mockMvc.perform(post("/payment/create")
                            .header("Authorization", "Bearer " + customerToken)
                            .header("Idempotency-Key", "key-stripe-fail")
                            .contentType(MediaType.APPLICATION_JSON).content(json(req)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value("PAYMENT_FAILED"));

            Payment saved = paymentRepository.findByUuid("key-stripe-fail-intent").orElseThrow();
            assertThat(saved.getStatus()).isEqualTo(Payment.Status.PAYMENT_FAILED);
        }
    }

    // ────────────────────── Status & orders endpoints ──────────────────────

    @Test
    void status_unknownPayment_returns404() throws Exception {
        mockMvc.perform(get("/payment/status/does-not-exist")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void status_otherUsersPayment_returns404() throws Exception {
        Payment p = persistPayment("other-uuid", otherCustomer, 5000, Payment.Status.CREATED, null);
        mockMvc.perform(get("/payment/status/" + p.getUuid())
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void status_ownPayment_returns200() throws Exception {
        Payment p = persistPayment("own-uuid", customer, 5000, Payment.Status.CREATED, null);
        mockMvc.perform(get("/payment/status/" + p.getUuid())
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentUuid").value("own-uuid"))
                .andExpect(jsonPath("$.amount").value(5000));
    }

    @Test
    void orders_listEmpty_returnsEmptyArray() throws Exception {
        mockMvc.perform(get("/payment/orders")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void orders_list_returnsCustomerOrders() throws Exception {
        persistPayment("mine-1", customer, 1000, Payment.Status.PAYMENT_SUCCEEDED, publishedGame);
        persistPayment("not-mine", otherCustomer, 1000, Payment.Status.PAYMENT_SUCCEEDED, publishedGame);
        mockMvc.perform(get("/payment/orders")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].uuid").value("mine-1"));
    }

    @Test
    void orders_getUnknown_returns404() throws Exception {
        mockMvc.perform(get("/payment/orders/999999")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void orders_getOtherUsers_returns404() throws Exception {
        Payment p = persistPayment("other-order", otherCustomer, 1000, Payment.Status.PAYMENT_SUCCEEDED, publishedGame);
        mockMvc.perform(get("/payment/orders/" + p.getId())
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void orders_getOwn_returns200() throws Exception {
        Payment p = persistPayment("mine-2", customer, 1000, Payment.Status.PAYMENT_SUCCEEDED, publishedGame);
        mockMvc.perform(get("/payment/orders/" + p.getId())
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uuid").value("mine-2"))
                .andExpect(jsonPath("$.items[0].gameId").value(publishedGame.getId()));
    }

    // ────────────────────── Webhook ──────────────────────

    @Test
    void webhook_invalidSignature_returns400() throws Exception {
        try (MockedStatic<Webhook> webhookStatic = mockStatic(Webhook.class)) {
            SignatureVerificationException ex = mock(SignatureVerificationException.class);
            webhookStatic.when(() -> Webhook.constructEvent(anyString(), anyString(), anyString()))
                    .thenThrow(ex);
            mockMvc.perform(post("/payment/webhook/stripe")
                            .header("Stripe-Signature", "bogus")
                            .contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void webhook_paymentIntentSucceeded_assignsKeyAndMarksOwned() throws Exception {
        Payment payment = persistPayment("wh-success", customer, 5000, Payment.Status.CREATED, publishedGame);
        Transaction tx = transactionRepository.save(Transaction.builder()
                .uuid(UUID.randomUUID().toString())
                .gateway("STRIPE")
                .gatewayTransactionId("pi_wh_success")
                .status("requires_payment_method")
                .payment(payment).build());

        PaymentIntent intent = mock(PaymentIntent.class);
        when(intent.getId()).thenReturn("pi_wh_success");
        Event event = newMockEvent("payment_intent.succeeded", intent);

        try (MockedStatic<Webhook> webhookStatic = mockStatic(Webhook.class)) {
            webhookStatic.when(() -> Webhook.constructEvent(anyString(), anyString(), anyString()))
                    .thenReturn(event);
            mockMvc.perform(post("/payment/webhook/stripe")
                            .header("Stripe-Signature", "valid")
                            .contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isOk());
        }

        txTemplate.executeWithoutResult(s -> {
            Payment after = paymentRepository.findByUuid("wh-success").orElseThrow();
            assertThat(after.getStatus()).isEqualTo(Payment.Status.PAYMENT_SUCCEEDED);
            assertThat(after.getItems().get(0).getAssignedKey()).isNotNull();
            Customer c = customerRepository.findById(customer.getId()).orElseThrow();
            assertThat(c.getOwnedGames()).extracting(Game::getId).contains(publishedGame.getId());
            Transaction afterTx = transactionRepository.findById(tx.getId()).orElseThrow();
            assertThat(afterTx.getStatus()).isEqualTo("SUCCEEDED");
        });
    }

    @Test
    void webhook_paymentIntentFailed_marksPaymentFailed() throws Exception {
        Payment payment = persistPayment("wh-failed", customer, 5000, Payment.Status.CREATED, publishedGame);
        transactionRepository.save(Transaction.builder()
                .uuid(UUID.randomUUID().toString())
                .gateway("STRIPE")
                .gatewayTransactionId("pi_wh_failed")
                .status("requires_payment_method")
                .payment(payment).build());

        PaymentIntent intent = mock(PaymentIntent.class);
        when(intent.getId()).thenReturn("pi_wh_failed");
        Event event = newMockEvent("payment_intent.payment_failed", intent);

        try (MockedStatic<Webhook> webhookStatic = mockStatic(Webhook.class)) {
            webhookStatic.when(() -> Webhook.constructEvent(anyString(), anyString(), anyString()))
                    .thenReturn(event);
            mockMvc.perform(post("/payment/webhook/stripe")
                            .header("Stripe-Signature", "valid")
                            .contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isOk());
        }

        Payment after = paymentRepository.findByUuid("wh-failed").orElseThrow();
        assertThat(after.getStatus()).isEqualTo(Payment.Status.PAYMENT_FAILED);
    }

    @Test
    void webhook_unknownGatewayId_isNoop() throws Exception {
        PaymentIntent intent = mock(PaymentIntent.class);
        when(intent.getId()).thenReturn("pi_unknown_no_match");
        Event event = newMockEvent("payment_intent.succeeded", intent);

        try (MockedStatic<Webhook> webhookStatic = mockStatic(Webhook.class)) {
            webhookStatic.when(() -> Webhook.constructEvent(anyString(), anyString(), anyString()))
                    .thenReturn(event);
            mockMvc.perform(post("/payment/webhook/stripe")
                            .header("Stripe-Signature", "valid")
                            .contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isOk());
        }
    }

    @Test
    void webhook_unknownEventType_isIgnored() throws Exception {
        Event event = mock(Event.class);
        when(event.getId()).thenReturn("evt_other");
        when(event.getType()).thenReturn("charge.refunded");

        try (MockedStatic<Webhook> webhookStatic = mockStatic(Webhook.class)) {
            webhookStatic.when(() -> Webhook.constructEvent(anyString(), anyString(), anyString()))
                    .thenReturn(event);
            mockMvc.perform(post("/payment/webhook/stripe")
                            .header("Stripe-Signature", "valid")
                            .contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isOk());
        }
    }

    // ────────────────────── Helpers ──────────────────────

    private Payment persistPayment(String uuid, Customer owner, long amount, Payment.Status status, Game game) {
        Payment payment = Payment.builder()
                .uuid(uuid).customer(owner).amount(amount).currency("ron")
                .description("test").status(status).build();
        if (game != null) {
            PaymentItem item = PaymentItem.builder()
                    .payment(payment).game(game).unitAmount(amount).quantity(1).build();
            payment.setItems(new ArrayList<>(List.of(item)));
        }
        return paymentRepository.save(payment);
    }

    private Event newMockEvent(String type, PaymentIntent intent) {
        Event event = mock(Event.class);
        when(event.getId()).thenReturn("evt_test_" + UUID.randomUUID());
        when(event.getType()).thenReturn(type);
        EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of((StripeObject) intent));
        return event;
    }
}
