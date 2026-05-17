package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.model.Tag;
import com.unibuc.bundle_forge.repository.TagRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TagServiceTest {

    @Mock
    private TagRepository tagRepository;

    @InjectMocks
    private TagService tagService;

    @Test
    void getAllTags_returnsAll() {
        Tag a = Tag.builder().id(1).name("action").build();
        Tag b = Tag.builder().id(2).name("rpg").build();
        when(tagRepository.findAll()).thenReturn(List.of(a, b));

        List<Tag> result = tagService.getAllTags();

        assertThat(result).containsExactly(a, b);
    }

    @Test
    void getOrCreateTag_existing_returnsExisting() {
        Tag existing = Tag.builder().id(1).name("indie").build();
        when(tagRepository.findByName("indie")).thenReturn(Optional.of(existing));

        Tag result = tagService.getOrCreateTag("indie");

        assertThat(result).isSameAs(existing);
        verify(tagRepository, never()).save(any());
    }

    @Test
    void getOrCreateTag_missing_savesNew() {
        when(tagRepository.findByName("new-tag")).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class))).thenAnswer(inv -> inv.getArgument(0));

        Tag result = tagService.getOrCreateTag("  new-tag  ");

        ArgumentCaptor<Tag> captor = ArgumentCaptor.forClass(Tag.class);
        verify(tagRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("new-tag");
        assertThat(result.getName()).isEqualTo("new-tag");
    }

    @Test
    void getOrCreateTag_blank_throws() {
        assertThatThrownBy(() -> tagService.getOrCreateTag("  "))
                .isInstanceOf(ValidationException.class);
        assertThatThrownBy(() -> tagService.getOrCreateTag(null))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void getTagsByIds_empty_returnsEmpty() {
        assertThat(tagService.getTagsByIds(null)).isEmpty();
        assertThat(tagService.getTagsByIds(List.of())).isEmpty();
        verifyNoInteractions(tagRepository);
    }

    @Test
    void getTagsByIds_returnsSet() {
        Tag a = Tag.builder().id(1).name("a").build();
        Tag b = Tag.builder().id(2).name("b").build();
        when(tagRepository.findAllById(List.of(1, 2))).thenReturn(List.of(a, b));

        Set<Tag> result = tagService.getTagsByIds(List.of(1, 2));

        assertThat(result).containsExactlyInAnyOrder(a, b);
    }

    @Test
    void createTag_blank_throws() {
        assertThatThrownBy(() -> tagService.createTag(""))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void createTag_duplicate_throws() {
        when(tagRepository.findByName("dup")).thenReturn(Optional.of(Tag.builder().id(1).name("dup").build()));

        assertThatThrownBy(() -> tagService.createTag("dup"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void createTag_saves() {
        when(tagRepository.findByName("fresh")).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class))).thenAnswer(inv -> {
            Tag t = inv.getArgument(0);
            t.setId(99);
            return t;
        });

        Tag result = tagService.createTag("fresh");

        assertThat(result.getId()).isEqualTo(99);
        assertThat(result.getName()).isEqualTo("fresh");
    }
}
