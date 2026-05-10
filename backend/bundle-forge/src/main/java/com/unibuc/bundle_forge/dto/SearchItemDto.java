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
public class SearchItemDto {
    private Integer id;
    private String type;
    private String title;
    private String cover;
    private Double price;
    private Integer discountPercentage;
    private String developer;
    private List<String> tags;
    private List<String> platforms;
}
