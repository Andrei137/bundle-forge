package com.unibuc.bundle_forge.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public final class GameCreateDto {

    @NotBlank(message = "title is required and cannot be blank")
    private String title;

    @DecimalMin(value = "0.0", message = "Price must be greater or equal to 0")
    private Double price;

}
