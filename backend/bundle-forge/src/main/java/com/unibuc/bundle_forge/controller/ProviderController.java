package com.unibuc.bundle_forge.controller;

import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.annotation.RequireProvider;
import com.unibuc.bundle_forge.dto.ProviderCreateDto;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.service.ProviderService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import com.unibuc.bundle_forge.utils.ValidationUtils;
import com.unibuc.bundle_forge.utils.ViewUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@RequiredArgsConstructor
public abstract class ProviderController<P extends Provider, D extends ProviderCreateDto> {

    public abstract ProviderService<P, D> getService();

    @GetMapping("")
    @JsonView(ViewUtils.Public.class)
    public ResponseEntity<List<P>> getAll() {
        return ResponseUtils.ok(getService().getProvidersByStatus(Provider.Status.ACCEPTED));
    }

    @GetMapping("/me")
    @JsonView(ViewUtils.Public.class)
    @RequireProvider({Developer.class, Publisher.class})
    public ResponseEntity<P> getCurrent() {
        return ResponseUtils.ok(getService().getCurrentUser());
    }

    @GetMapping("/{providerId}")
    @JsonView(ViewUtils.Public.class)
    public ResponseEntity<P> getById(@PathVariable Integer providerId) {
        return ResponseUtils.ok(getService().getProviderByIdAndStatus(providerId, Provider.Status.ACCEPTED));
    }

    @PutMapping("")
    @JsonView(ViewUtils.Public.class)
    @RequireProvider({Developer.class, Publisher.class})
    public ResponseEntity<P> updateCurrent(@RequestBody @Validated(ValidationUtils.Update.class) D dto) {
        return ResponseUtils.ok(getService().updateLoggedUser(dto));
    }

}
