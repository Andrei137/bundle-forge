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
public class BundleGameDto {
    private Integer id;
    private String title;
    private String cover;
    private Double rrp;
    private List<String> platforms;
}
