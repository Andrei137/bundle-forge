package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.annotation.RequireCustomer;
import com.unibuc.bundle_forge.dto.CreatePaymentRequestDto;
import com.unibuc.bundle_forge.dto.OrderDto;
import com.unibuc.bundle_forge.dto.PaymentResponseDto;
import com.unibuc.bundle_forge.service.StripePaymentService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final StripePaymentService stripePaymentService;

    @PostMapping("/create")
    @RequireCustomer
    public ResponseEntity<PaymentResponseDto> createPayment(
            @Valid @RequestBody CreatePaymentRequestDto request,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey
    ) {
        PaymentResponseDto response = stripePaymentService.createPayment(request, idempotencyKey);
        return response.isSuccess()
                ? ResponseUtils.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/status/{paymentUuid}")
    @RequireCustomer
    public ResponseEntity<PaymentResponseDto> getStatus(@PathVariable String paymentUuid) {
        return ResponseUtils.ok(stripePaymentService.getStatus(paymentUuid));
    }

    @PostMapping("/webhook/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader,
            @RequestBody String payload
    ) {
        stripePaymentService.handleWebhook(sigHeader, payload);
        return ResponseEntity.ok("");
    }

    @GetMapping("/orders")
    @RequireCustomer
    public ResponseEntity<List<OrderDto>> listMyOrders() {
        return ResponseUtils.ok(stripePaymentService.listMyOrders());
    }

    @GetMapping("/orders/{orderId}")
    @RequireCustomer
    public ResponseEntity<OrderDto> getMyOrder(@PathVariable Long orderId) {
        return ResponseUtils.ok(stripePaymentService.getMyOrder(orderId));
    }
}
