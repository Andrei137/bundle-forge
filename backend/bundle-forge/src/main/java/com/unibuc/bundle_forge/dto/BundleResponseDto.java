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
public class BundleResponseDto {
    private Integer id;
    private String title;
    private String cover;
    private String shortDescription;
    private String longDescription;
    private Integer platformMinPct;
    private Integer devMinPct;
    private List<BundleGameDto> games;
    private List<BundleTierDto> tiers;
    private CharityFounderDto charity;
}
