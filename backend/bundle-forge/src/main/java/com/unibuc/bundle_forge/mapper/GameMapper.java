package com.unibuc.bundle_forge.mapper;

import com.unibuc.bundle_forge.dto.GameCreateDto;
import com.unibuc.bundle_forge.dto.GameResponseDto;
import com.unibuc.bundle_forge.dto.GameUpdateDto;
import com.unibuc.bundle_forge.model.Game;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public final class GameMapper {

    public void updateEntityFromDto(GameUpdateDto dto, Game entity) {
        Optional.ofNullable(dto.getDiscountPercentage()).ifPresent(entity::setDiscountPercentage);
    }

    public Game toEntity(GameCreateDto dto) {
        var builder = Game.builder()
                .title(dto.getTitle())
                .releaseDate(LocalDate.now())
                .status(Game.Status.ANNOUNCED);
        Optional.ofNullable(dto.getPrice())
                .ifPresent(builder::price);
        return builder.build();
    }

    public GameResponseDto toResponseDto(Game entity) {
        return GameResponseDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .price(entity.getPrice() - entity.getPrice() * entity.getDiscountPercentage() / 100)
                .releaseDate(entity.getReleaseDate())
                .discountPercentage(entity.getDiscountPercentage())
                .initialPrice(entity.getPrice())
                .status(entity.getStatus())
                .build();
    }

}