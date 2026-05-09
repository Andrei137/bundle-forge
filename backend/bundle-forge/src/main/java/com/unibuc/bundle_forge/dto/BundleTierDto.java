package com.unibuc.bundle_forge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BundleTierDto {
    private Integer numRequiredGames;
    private Double pricePerGame;
}
