package com.unibuc.bundle_forge.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {

    @NotNull
    private Integer gameId;

    @NotNull
    @Min(1)
    private Integer quantity;

    private Integer bundleId;

    private Integer platformPct;

    private Integer devPct;

    private Long unitAmount;
}
