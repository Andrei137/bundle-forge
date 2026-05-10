package com.unibuc.bundle_forge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FeaturedSlideDto {
    private String label;
    private FeaturedItemDto main;
    private List<FeaturedItemDto> support;
}
