package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.CharityFounderCreateDto;
import com.unibuc.bundle_forge.dto.CharityFounderDto;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.model.CharityFounder;
import com.unibuc.bundle_forge.model.Website;
import com.unibuc.bundle_forge.repository.CharityFounderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CharityFounderServiceTest {

    @Mock
    private CharityFounderRepository repository;

    @InjectMocks
    private CharityFounderService service;

    private CharityFounder entity(Integer id) {
        return CharityFounder.builder()
                .id(id)
                .name("Charity " + id)
                .website(Website.builder().url("https://charity.test").build())
                .shortDescription("short")
                .longDescription("long")
                .build();
    }

    private CharityFounderCreateDto dto(String name) {
        CharityFounderCreateDto d = new CharityFounderCreateDto();
        d.setName(name);
        d.setWebsite("https://charity.test");
        d.setShortDescription("short");
        d.setLongDescription("long desc");
        return d;
    }

    @Test
    void getAll_returnsMappedDtos() {
        when(repository.findAll()).thenReturn(List.of(entity(1), entity(2)));
        List<CharityFounderDto> result = service.getAll();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(1);
        assertThat(result.get(1).getName()).isEqualTo("Charity 2");
    }

    @Test
    void getById_returnsDto() {
        when(repository.findById(7)).thenReturn(Optional.of(entity(7)));
        CharityFounderDto result = service.getById(7);
        assertThat(result.getId()).isEqualTo(7);
    }

    @Test
    void getById_notFound_throws() {
        when(repository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getById(99))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void create_savesEntity() {
        CharityFounderCreateDto d = dto("New");
        when(repository.save(any(CharityFounder.class))).thenAnswer(inv -> {
            CharityFounder e = inv.getArgument(0);
            e.setId(10);
            return e;
        });

        CharityFounderDto result = service.create(d);

        ArgumentCaptor<CharityFounder> captor = ArgumentCaptor.forClass(CharityFounder.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("New");
        assertThat(result.getId()).isEqualTo(10);
    }

    @Test
    void update_updatesFields() {
        CharityFounder existing = entity(1);
        when(repository.findById(1)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CharityFounderDto result = service.update(1, dto("Updated"));

        assertThat(existing.getName()).isEqualTo("Updated");
        assertThat(result.getName()).isEqualTo("Updated");
    }

    @Test
    void update_notFound_throws() {
        when(repository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.update(99, dto("Nope")))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void delete_deletes() {
        CharityFounder existing = entity(1);
        when(repository.findById(1)).thenReturn(Optional.of(existing));

        ResponseEntity<Void> result = service.delete(1);

        verify(repository).delete(existing);
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
    }
}
