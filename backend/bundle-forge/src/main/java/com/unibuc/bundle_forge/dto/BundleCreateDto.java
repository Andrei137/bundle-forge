package com.unibuc.bundle_forge.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class BundleCreateDto {

    @NotBlank(message = "title is required")
    private String title;

    @NotBlank(message = "shortDescription is required")
    @Size(max = 1000)
    private String shortDescription;

    @NotBlank(message = "longDescription is required")
    private String longDescription;

    @NotNull(message = "platformMinPct is required")
    @Min(value = 0, message = "platformMinPct must be between 0 and 100")
    @Max(value = 100, message = "platformMinPct must be between 0 and 100")
    private Integer platformMinPct;

    @NotNull(message = "devMinPct is required")
    @Min(value = 0, message = "devMinPct must be between 0 and 100")
    @Max(value = 100, message = "devMinPct must be between 0 and 100")
    private Integer devMinPct;

    @NotNull(message = "daysLeft is required")
    @Min(value = 1, message = "daysLeft must be at least 1")
    private Integer daysLeft;

    private Integer charityFounderId;

    @NotNull(message = "gameIds is required")
    private List<Integer> gameIds;

    @NotNull(message = "tiers is required")
    @Size(min = 1, message = "At least one tier is required")
    private List<TierDto> tiers;

    @Data
    public static class TierDto {
        @NotNull
        private Integer numRequiredGames;

        @NotNull
        @DecimalMin(value = "0.0")
        private Double pricePerGame;
    }
}
