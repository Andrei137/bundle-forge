package com.unibuc.bundle_forge.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public final class GameUpdateDto {

    @Min(value = 0, message = "discountPercentage must be at least 0")
    @Max(value = 100, message = "siscountPercentage cannot be more than 100")
    private Integer discountPercentage;

    @Pattern(
            regexp = "DEVELOPED|PUBLISHED|DELISTED",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "status must be one of DEVELOPED, PUBLISHED, DELISTED"
    )
    private String status;

}
