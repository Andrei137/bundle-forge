package com.unibuc.bundle_forge.mapper;

import com.unibuc.bundle_forge.dto.ProviderCreateDto;
import com.unibuc.bundle_forge.dto.ProviderResponseDto;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.utils.MapperUtils;
import org.springframework.stereotype.Component;

@Component
public abstract class ProviderMapper<U extends Provider, D extends ProviderCreateDto> extends UserMapper<U, D> {

    @Override
    public void updateEntityFromDto(D dto, U entity) {
        super.updateEntityFromDto(dto, entity);
        MapperUtils.setIfPresent(dto.getWebsite(), url -> entity.setWebsite(MapperUtils.applyWebsiteUrl(entity.getWebsite(), url)));
        MapperUtils.setIfPresent(dto.getDisplayName(), entity::setDisplayName);
    }

    public ProviderResponseDto toProviderResponseDto(Provider entity, String type) {
        return ProviderResponseDto.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .website(MapperUtils.websiteUrl(entity.getWebsite()))
                .displayName(entity.getDisplayName())
                .status(entity.getStatus())
                .type(type)
                .build();
    }

}