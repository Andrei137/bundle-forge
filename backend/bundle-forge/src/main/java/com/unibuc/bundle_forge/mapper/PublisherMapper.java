package com.unibuc.bundle_forge.mapper;

import com.unibuc.bundle_forge.dto.PublisherDto;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.service.JwtService;
import org.springframework.stereotype.Component;

@Component
public final class PublisherMapper extends ProviderMapper<Publisher, PublisherDto> {

    public Publisher toEntity(PublisherDto dto) {
        return Publisher.builder()
                .password(JwtService.encryptPassword(dto.getPassword()))
                .email(dto.getEmail())
                .website(dto.getWebsite())
                .displayName(dto.getDisplayName())
                .status(Provider.Status.PENDING)
                .build();
    }

}
