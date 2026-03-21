package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.dto.DeveloperDto;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.service.DeveloperService;
import com.unibuc.bundle_forge.service.ProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("developers")
@RequiredArgsConstructor
public class DeveloperController extends ProviderController<Developer, DeveloperDto> {

    private final DeveloperService developerService;

    @Override
    public ProviderService<Developer, DeveloperDto> getService() {
        return developerService;
    }

}
