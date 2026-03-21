package com.unibuc.bundle_forge.mapper;

import com.unibuc.bundle_forge.dto.UserDto;
import com.unibuc.bundle_forge.model.User;
import com.unibuc.bundle_forge.service.JwtService;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public abstract class UserMapper<U extends User, D extends UserDto> {

    public void updateEntityFromDto(D dto, U entity) {
        Optional.ofNullable(dto.getUsername()).ifPresent(entity::setUsername);
        Optional.ofNullable(dto.getPassword()).ifPresent(entity::setPassword);
        Optional.ofNullable(dto.getPassword())
                .ifPresent(raw -> entity.setPassword(JwtService.encryptPassword(raw)));
        Optional.ofNullable(dto.getEmail()).ifPresent(entity::setEmail);
    }

}