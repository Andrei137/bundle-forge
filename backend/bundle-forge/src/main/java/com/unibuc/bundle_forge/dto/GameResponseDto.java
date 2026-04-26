package com.unibuc.bundle_forge.dto;

import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.model.Image;
import com.unibuc.bundle_forge.utils.ViewUtils;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.List;

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
    private byte[] cover;

    @JsonView(ViewUtils.Public.class)
    private List<byte[]> images;

}
