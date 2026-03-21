package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.dto.PublisherDto;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.service.ProviderService;
import com.unibuc.bundle_forge.service.PublisherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("publishers")
@RequiredArgsConstructor
public class PublisherController extends ProviderController<Publisher, PublisherDto> {

    private final PublisherService publisherService;

    @Override
    public ProviderService<Publisher, PublisherDto> getService() {
        return publisherService;
    }
}
