package com.unibuc.bundle_forge.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BundleTier {
    private Integer numRequiredGames;
    private Double pricePerGame;
}
