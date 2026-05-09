package com.unibuc.bundle_forge.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public final class GameUpdateDto {

    private String title;

    @DecimalMin(value = "0.0", message = "Price must be greater or equal to 0")
    private Double price;

    private String shortDescription;

    private String longDescription;

    private List<String> languages;

    private String link;

    private List<Integer> tagIds = new ArrayList<>();

    private List<String> youtubeIds;

    @Valid
    private Map<String, PlatformRequirements> systemRequirements;

    @Min(value = 0, message = "discountPercentage must be at least 0")
    @Max(value = 100, message = "discountPercentage cannot be more than 100")
    private Integer discountPercentage;

    @Pattern(
            regexp = "ANNOUNCED|PUBLISHED|DELISTED",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "status must be one of ANNOUNCED, PUBLISHED, DELISTED"
    )
    private String status;

    private List<String> existingImages = new ArrayList<>();

}
