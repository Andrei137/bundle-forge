package com.unibuc.bundle_forge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public final class ProviderUpdateDto {

    @NotBlank(message = "status is required")
    @Pattern(
            regexp = "ACCEPTED|REJECTED|BANNED",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "status must be one of ACCEPTED, REJECTED, BANNED"
    )
    private String status;

}
