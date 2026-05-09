package com.unibuc.bundle_forge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CharityFounderCreateDto {

    @NotBlank(message = "name is required")
    private String name;

    private String website;

    @NotBlank(message = "shortDescription is required")
    @Size(max = 250, message = "shortDescription must be at most 250 characters")
    private String shortDescription;

    @NotBlank(message = "longDescription is required")
    private String longDescription;
}
