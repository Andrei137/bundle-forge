package com.unibuc.bundle_forge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CharityFounderDto {
    private Integer id;
    private String name;
    private String website;
    private String shortDescription;
    private String longDescription;
}
