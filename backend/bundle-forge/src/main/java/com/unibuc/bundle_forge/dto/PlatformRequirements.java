package com.unibuc.bundle_forge.dto;

import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.utils.ViewUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlatformRequirements {

    @NotNull(message = "Minimum requirements are required")
    @Valid
    @JsonView(ViewUtils.Public.class)
    private Requirement minimum;

    @NotNull(message = "Recommended requirements are required")
    @Valid
    @JsonView(ViewUtils.Public.class)
    private Requirement recommended;

}