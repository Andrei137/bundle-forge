package com.unibuc.bundle_forge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponseDto {
    private String code;
    private String name;
    private String type;
    private BigDecimal value;
}
