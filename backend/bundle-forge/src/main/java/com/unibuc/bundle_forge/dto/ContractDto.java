package com.unibuc.bundle_forge.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public final class ContractDto {

    @Min(value = 0, message = "Cut percentage cannot be less than 0")
    @Max(value = 100, message = "Cut percentage cannot be greater than 100")
    private Integer cutPercentage;

    private LocalDate expiryDate;

    @Pattern(
            regexp = "ACCEPTED|REJECTED",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "status must be one of ACCEPTED, REJECTED"
    )
    private String status;

}