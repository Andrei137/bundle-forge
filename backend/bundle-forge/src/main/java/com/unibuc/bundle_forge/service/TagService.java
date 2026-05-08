package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.model.Tag;
import com.unibuc.bundle_forge.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    public Tag getOrCreateTag(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new ValidationException("Tag name cannot be empty");
        }

        String trimmedName = name.trim();
        return tagRepository.findByName(trimmedName)
                .orElseGet(() -> {
                    Tag newTag = Tag.builder()
                            .name(trimmedName)
                            .build();
                    return tagRepository.save(newTag);
                });
    }

    public Set<Tag> getTagsByIds(List<Integer> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return Set.of();
        }
        return tagRepository.findAllById(tagIds).stream().collect(Collectors.toSet());
    }

    public Tag createTag(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new ValidationException("Tag name cannot be empty");
        }

        String trimmedName = name.trim();
        if (tagRepository.findByName(trimmedName).isPresent()) {
            throw new ValidationException("Tag with name '" + trimmedName + "' already exists");
        }

        Tag tag = Tag.builder()
                .name(trimmedName)
                .build();
        return tagRepository.save(tag);
    }
}
