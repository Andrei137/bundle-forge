package com.unibuc.bundle_forge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDto {
    private boolean success;
    private Long paymentId;
    private String paymentUuid;
    private String clientSecret;
    private Long amount;
    private String currency;
    private String status;
    private String message;
}
