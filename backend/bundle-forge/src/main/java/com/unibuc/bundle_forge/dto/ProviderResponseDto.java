package com.unibuc.bundle_forge.dto;

import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.utils.ViewUtils;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
public final class ProviderResponseDto {

    @JsonView(ViewUtils.Public.class)
    private Integer id;

    @JsonView(ViewUtils.Public.class)
    private String username;

    @JsonView(ViewUtils.Public.class)
    private String email;

    @JsonView(ViewUtils.Public.class)
    private String website;

    @JsonView(ViewUtils.Public.class)
    private String displayName;

    @JsonView(ViewUtils.Admin.class)
    private String type;

    @JsonView(ViewUtils.Admin.class)
    private Provider.Status status;

}
