package com.unibuc.bundle_forge.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public abstract class ProviderCreateDto extends UserDto {

    @Pattern(
            regexp = "^(https?://)?([\\w-]+\\.)+[\\w-]{2,}(/\\S*)?$",
            message = "website must be a valid URL"
    )
    private String website;

}
