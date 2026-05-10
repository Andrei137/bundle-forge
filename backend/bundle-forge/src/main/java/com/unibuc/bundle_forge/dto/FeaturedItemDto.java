package com.unibuc.bundle_forge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FeaturedItemDto {
    private Integer id;
    private String type;
    private String title;
    private String cover;
    private Double price;
    private Integer discountPercentage;
    private String developer;
}
