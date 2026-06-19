package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.CharityFounderCreateDto;
import com.unibuc.bundle_forge.dto.CharityFounderDto;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.model.CharityFounder;
import com.unibuc.bundle_forge.repository.CharityFounderRepository;
import com.unibuc.bundle_forge.utils.MapperUtils;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CharityFounderService {

    private final CharityFounderRepository charityFounderRepository;

    public List<CharityFounderDto> getAll() {
        return charityFounderRepository.findAll().stream().map(this::toDto).toList();
    }

    public CharityFounderDto getById(Integer id) {
        return toDto(findById(id));
    }

    public CharityFounderDto create(CharityFounderCreateDto dto) {
        CharityFounder entity = CharityFounder.builder()
                .name(dto.getName())
                .website(MapperUtils.applyWebsiteUrl(null, dto.getWebsite()))
                .shortDescription(dto.getShortDescription())
                .longDescription(dto.getLongDescription())
                .build();
        return toDto(charityFounderRepository.save(entity));
    }

    public CharityFounderDto update(Integer id, CharityFounderCreateDto dto) {
        CharityFounder entity = findById(id);
        entity.setName(dto.getName());
        entity.setWebsite(MapperUtils.applyWebsiteUrl(entity.getWebsite(), dto.getWebsite()));
        entity.setShortDescription(dto.getShortDescription());
        entity.setLongDescription(dto.getLongDescription());
        return toDto(charityFounderRepository.save(entity));
    }

    public ResponseEntity<Void> delete(Integer id) {
        charityFounderRepository.delete(findById(id));
        return ResponseUtils.noContent();
    }

    public CharityFounder findById(Integer id) {
        return charityFounderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(String.format("Charity founder with id %d not found", id)));
    }

    public CharityFounderDto toDto(CharityFounder entity) {
        return CharityFounderDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .website(MapperUtils.websiteUrl(entity.getWebsite()))
                .shortDescription(entity.getShortDescription())
                .longDescription(entity.getLongDescription())
                .build();
    }
}
