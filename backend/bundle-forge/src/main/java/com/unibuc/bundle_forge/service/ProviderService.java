package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.ProviderCreateDto;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

public abstract class ProviderService<P extends Provider, D extends ProviderCreateDto> extends UserService<P, D> {

    @Autowired
    private JwtService jwtService;

    protected abstract ProviderRepository<P> getRepository();

    public final List<P> getProvidersByStatus(Provider.Status status) {
        return getRepository().findByStatus(status);
    }

    public final P getProviderByIdAndStatus(Integer id, Provider.Status status) {
        return getRepository()
                .findByIdAndStatus(id, status)
                .orElseThrow(() -> new NotFoundException(String.format("No %s found at id %d", getEntityName(), id)));
    }

}
