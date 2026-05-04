package com.unibuc.bundle_forge.dto;

import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.utils.ViewUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public final class GameCreateDto {

    @NotBlank(message = "title is required and cannot be blank")
    private String title;

    @DecimalMin(value = "0.0", message = "Price must be greater or equal to 0")
    private Double price;

    @NotBlank(message = "description is required and cannot be blank")
    private String description;

    @NotNull(message = "systemRequirements is required")
    @Size(min = 1, message = "At least one platform is required")
    @Valid
    private Map<
            @NotBlank(message = "Platform key cannot be blank")
            String,

            @NotNull(message = "Platform requirements cannot be null")
            @Valid PlatformRequirements
            > systemRequirements;

}
