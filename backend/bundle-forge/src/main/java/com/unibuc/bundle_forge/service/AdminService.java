package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.ProviderResponseDto;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.mapper.DeveloperMapper;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.repository.DeveloperRepository;
import com.unibuc.bundle_forge.utils.EnumUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public final class AdminService {

    private final DeveloperRepository developerRepository;
    private final DeveloperMapper developerMapper;

    public List<ProviderResponseDto> getProviders(String status, String name) {
        Provider.Status statusObj = EnumUtils.fromString(Provider.Status.class, status);
        String normalizedName = (name == null) ? "" : name.toLowerCase().trim();

        return developerRepository
                .findAll()
                .stream()
                .filter(p -> statusObj == null || p.getStatus().equals(statusObj))
                .filter(p -> normalizedName.isEmpty() || p.getEmail().toLowerCase().contains(normalizedName))
                .map(dev -> developerMapper.toProviderResponseDto(dev, "developer"))
                .toList();
    }

    public ProviderResponseDto changeProviderStatus(Integer id, String status) {
        Developer developer = developerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Provider with id " + id + " not found"));
        EnumUtils.updateStatus(status, developer, Provider.Status.class);
        developerRepository.save(developer);
        return developerMapper.toProviderResponseDto(developer, "developer");
    }

}
