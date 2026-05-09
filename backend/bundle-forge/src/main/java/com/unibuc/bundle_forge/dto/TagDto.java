package com.unibuc.bundle_forge.dto;

import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.utils.ViewUtils;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public final class TagDto {
    @JsonView(ViewUtils.Public.class)
    private Integer id;

    @JsonView(ViewUtils.Public.class)
    private String name;
}
