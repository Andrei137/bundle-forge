package com.unibuc.bundle_forge.dto;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.utils.ViewUtils;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Requirement {

    @JsonView(ViewUtils.Public.class)
    private String note;

    @NotBlank(message = "OS is required")
    @JsonView(ViewUtils.Public.class)
    private String os;

    @NotBlank(message = "Processor is required")
    @JsonView(ViewUtils.Public.class)
    private String processor;

    @NotBlank(message = "Memory is required")
    @JsonView(ViewUtils.Public.class)
    private String memory;

    @NotBlank(message = "Graphics is required")
    @JsonView(ViewUtils.Public.class)
    private String graphics;

    @NotBlank(message = "Graphics API is required")
    @JsonView(ViewUtils.Public.class)
    private String graphicsAPI;

    @NotBlank(message = "Storage is required")
    @JsonView(ViewUtils.Public.class)
    private String storage;

}