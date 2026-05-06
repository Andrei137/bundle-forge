package com.unibuc.bundle_forge.dto;

import com.unibuc.bundle_forge.utils.ValidationUtils.*;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public abstract class UserDto {

    @NotBlank(message = "password is required and cannot be blank", groups = Create.class)
    private String password;

    @NotBlank(message = "email is required and cannot be blank", groups = Create.class)
    @Email(message = "email must be valid")
    private String email;

    private String currentPassword;

}