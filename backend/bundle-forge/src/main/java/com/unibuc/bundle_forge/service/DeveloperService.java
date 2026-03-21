package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.DeveloperDto;
import com.unibuc.bundle_forge.mapper.DeveloperMapper;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.repository.DeveloperRepository;
import com.unibuc.bundle_forge.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public final class DeveloperService extends ProviderService<Developer, DeveloperDto> {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private DeveloperRepository developerRepository;

    @Autowired
    private DeveloperMapper developerMapper;

    @Override
    protected ProviderRepository<Developer> getRepository() {
        return developerRepository;
    }

    @Override
    protected String getEntityName() {
        return "developer";
    }

    @Override
    protected DeveloperMapper getMapper() {
        return developerMapper;
    }

}
