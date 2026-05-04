package com.unibuc.bundle_forge.dto;

import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.utils.ViewUtils;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public final class GameResponseDto {

    @JsonView(ViewUtils.Public.class)
    private Integer id;

    @JsonView(ViewUtils.Public.class)
    private String title;

    @JsonView(ViewUtils.Public.class)
    private Double price;

    @JsonView(ViewUtils.Public.class)
    private LocalDate releaseDate;

    @JsonView(ViewUtils.Provider.class)
    private Integer discountPercentage;

    @JsonView(ViewUtils.Provider.class)
    private Double initialPrice;

    @JsonView(ViewUtils.Provider.class)
    private Game.Status status;

    @JsonView(ViewUtils.Public.class)
    private String cover;

    @JsonView(ViewUtils.Public.class)
    private List<String> images;

    @JsonView(ViewUtils.Public.class)
    private String shortDescription;

    @JsonView(ViewUtils.Public.class)
    private String longDescription;

    @JsonView(ViewUtils.Public.class)
    private List<String> languages;

    @JsonView(ViewUtils.Public.class)
    private String link;

    @JsonView(ViewUtils.Public.class)
    private Map<String, PlatformRequirements> systemRequirements;

}
