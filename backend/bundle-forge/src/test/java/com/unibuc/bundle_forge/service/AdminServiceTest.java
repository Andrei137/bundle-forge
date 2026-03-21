package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.ProviderResponseDto;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.mapper.DeveloperMapper;
import com.unibuc.bundle_forge.mapper.PublisherMapper;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.repository.DeveloperRepository;
import com.unibuc.bundle_forge.repository.PublisherRepository;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminServiceTest {

    @Mock
    private DeveloperRepository developerRepository;

    @Mock
    private PublisherRepository publisherRepository;

    @Mock
    private DeveloperMapper developerMapper;

    @Mock
    private PublisherMapper publisherMapper;

    @InjectMocks
    private AdminService adminService;

    private Developer developer;
    private Publisher publisher;

    @BeforeEach
    void setUp() {
        developer = TestUtils.developer1;
        publisher = TestUtils.publisher1;
    }

    @Test
    void getProviders_WhenNoFilters_ShouldGetProviders() {
        when(developerRepository.findAll()).thenReturn(List.of(developer));
        when(publisherRepository.findAll()).thenReturn(List.of(publisher));
        when(developerMapper.toProviderResponseDto(developer, "developer")).thenReturn(TestUtils.developerDto);
        when(publisherMapper.toProviderResponseDto(publisher, "publisher")).thenReturn(TestUtils.publisherDto);

        List<ProviderResponseDto> result = adminService.getProviders(null, null);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(TestUtils.developerDto, result.get(0));
        assertEquals(TestUtils.publisherDto, result.get(1));

        verify(developerRepository, times(1)).findAll();
        verify(publisherRepository, times(1)).findAll();
    }

    @Test
    void getProviders_WhenNameFilter_ShouldGetProviders() {
        when(developerRepository.findAll()).thenReturn(List.of(developer));
        when(publisherRepository.findAll()).thenReturn(List.of(publisher));
        when(developerMapper.toProviderResponseDto(developer, "developer")).thenReturn(TestUtils.developerDto);

        List<ProviderResponseDto> result = adminService.getProviders(null, "developer");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(TestUtils.developerDto, result.getFirst());

        verify(developerRepository, times(1)).findAll();
        verify(publisherRepository, times(1)).findAll();
    }

    @Test
    void changeProviderStatus_WhenProviderNotFound_ShouldThrowNotFoundException() {
        when(developerRepository.existsById(404)).thenReturn(false);
        when(publisherRepository.findById(404)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.changeProviderStatus(404, "accepted"))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Provider with id 404 not found");
    }

    @Test
    void changeProviderStatus_WhenInvalidTransition_ShouldThrowNotFoundException() {
        when(developerRepository.existsById(developer.getId())).thenReturn(true);
        when(developerRepository.findById(developer.getId())).thenReturn(Optional.of(developer));

        assertThatThrownBy(() -> adminService.changeProviderStatus(developer.getId(), "rejected"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Cannot change status");
    }

    @Test
    void changeProviderStatus_WhenValidTransition_ShouldThrowNotFoundException() {
        Developer updatedDeveloper = developer.toBuilder().status(Provider.Status.BANNED).build();
        ProviderResponseDto updatedDeveloperDto = TestUtils.developerDto.toBuilder().status(Provider.Status.BANNED).build();

        when(developerRepository.existsById(developer.getId())).thenReturn(true);
        when(developerRepository.findById(developer.getId())).thenReturn(Optional.of(developer));
        when(developerRepository.save(updatedDeveloper)).thenReturn(updatedDeveloper);
        when(developerMapper.toProviderResponseDto(updatedDeveloper, "developer")).thenReturn(updatedDeveloperDto);

        ProviderResponseDto result = adminService.changeProviderStatus(developer.getId(), "banned");
        assertNotNull(result);
        assertEquals(updatedDeveloperDto, result);

        verify(developerRepository, times(1)).existsById(developer.getId());
        verify(developerRepository, times(1)).findById(developer.getId());
        verify(developerRepository, times(1)).save(updatedDeveloper);
    }

}
