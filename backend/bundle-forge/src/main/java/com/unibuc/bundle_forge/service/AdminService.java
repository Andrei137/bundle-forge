package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.ProviderResponseDto;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.mapper.DeveloperMapper;
import com.unibuc.bundle_forge.mapper.PublisherMapper;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.repository.DeveloperRepository;
import com.unibuc.bundle_forge.repository.ProviderRepository;
import com.unibuc.bundle_forge.repository.PublisherRepository;
import com.unibuc.bundle_forge.utils.EnumUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public final class AdminService {

    private final DeveloperRepository developerRepository;
    private final PublisherRepository publisherRepository;
    private final DeveloperMapper developerMapper;
    private final PublisherMapper publisherMapper;

    private <P extends Provider> List<P> getProviders(
            ProviderRepository<P> repository,
            String status,
            String name
    ) {
        Provider.Status statusObj = EnumUtils.fromString(Provider.Status.class, status);
        String normalizedName = (name == null) ? "" : name.toLowerCase().trim();

        return repository
                .findAll()
                .stream()
                .filter(p -> statusObj == null || p.getStatus().equals(statusObj))
                .filter(p -> normalizedName.isEmpty() || p.getEmail().toLowerCase().contains(normalizedName))
                .toList();
    }

    private <P extends Provider> ProviderResponseDto changeProviderStatus(
            ProviderRepository<P> repository,
            Integer id,
            String status
    ) {
        P entity = repository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Provider with id " + id + " not found"));
        EnumUtils.updateStatus(
                status,
                entity,
                Provider.Status.class
        );
        repository.save(entity);
        if (entity instanceof Publisher) {
            return publisherMapper.toProviderResponseDto(entity, "publisher");
        } else {
            return developerMapper.toProviderResponseDto(entity, "developer");
        }
    }

    public List<ProviderResponseDto> getProviders(String status, String name) {
        List<ProviderResponseDto> developers = getProviders(developerRepository, status, name)
                .stream()
                .map(dev -> developerMapper.toProviderResponseDto(dev, "developer"))
                .toList();

        List<ProviderResponseDto> publishers = getProviders(publisherRepository, status, name)
                .stream()
                .map(pub -> publisherMapper.toProviderResponseDto(pub, "publisher"))
                .toList();

        return Stream
                .concat(developers.stream(), publishers.stream())
                .toList();
    }

    public ProviderResponseDto changeProviderStatus(Integer id, String status) {
        return developerRepository.existsById(id)
                ? changeProviderStatus(developerRepository, id, status)
                : changeProviderStatus(publisherRepository, id, status);
    }

}
