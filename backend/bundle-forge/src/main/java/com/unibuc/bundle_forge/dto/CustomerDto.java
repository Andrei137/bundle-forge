package com.unibuc.bundle_forge.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public final class CustomerDto extends UserDto {

    @NotBlank(message = "firstName is required and cannot be blank")
    private String firstName;

    @NotBlank(message = "lastName is required and cannot be blank")
    private String lastName;

    @Pattern(
            regexp = "\\d{10}",
            message = "phoneNumber must be exactly 10 digits"
    )
    private String phoneNumber;

}
