package com.unibuc.bundle_forge.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public final class CredentialsDto {

    @NotBlank(message = "email is required and cannot be blank")
    private String email;

    @NotBlank(message = "password is required and cannot be blank")
    private String password;

}