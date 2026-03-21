package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.PublisherDto;
import com.unibuc.bundle_forge.mapper.PublisherMapper;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.repository.ProviderRepository;
import com.unibuc.bundle_forge.repository.PublisherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public final class PublisherService extends ProviderService<Publisher, PublisherDto> {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PublisherRepository publisherRepository;

    @Autowired
    private PublisherMapper publisherMapper;

    @Override
    protected ProviderRepository<Publisher> getRepository() {
        return publisherRepository;
    }

    @Override
    protected String getEntityName() {
        return "publisher";
    }

    @Override
    protected PublisherMapper getMapper() {
        return publisherMapper;
    }

}
