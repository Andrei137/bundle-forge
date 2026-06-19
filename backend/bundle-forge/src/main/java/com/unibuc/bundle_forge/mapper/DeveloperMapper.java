package com.unibuc.bundle_forge.mapper;

import com.unibuc.bundle_forge.dto.DeveloperDto;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.service.JwtService;
import com.unibuc.bundle_forge.utils.MapperUtils;
import org.springframework.stereotype.Component;

@Component
public final class DeveloperMapper extends ProviderMapper<Developer, DeveloperDto> {

    public Developer toEntity(DeveloperDto dto) {
        return Developer.builder()
                .password(JwtService.encryptPassword(dto.getPassword()))
                .email(dto.getEmail())
                .website(MapperUtils.applyWebsiteUrl(null, dto.getWebsite()))
                .displayName(dto.getDisplayName())
                .status(Provider.Status.PENDING)
                .build();
    }

}
