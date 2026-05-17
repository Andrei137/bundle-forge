package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.ProviderResponseDto;
import com.unibuc.bundle_forge.exception.NotFoundException;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private DeveloperRepository developerRepository;
    @Mock private PublisherRepository publisherRepository;
    @Mock private DeveloperMapper developerMapper;
    @Mock private PublisherMapper publisherMapper;

    @InjectMocks
    private AdminService adminService;

    private Developer pendingDev;
    private Developer acceptedDev;
    private Publisher pendingPub;

    @BeforeEach
    void setUp() {
        pendingDev = TestUtils.newDeveloper(1, "pending@dev.com", Provider.Status.PENDING);
        acceptedDev = TestUtils.newDeveloper(2, "accepted@dev.com", Provider.Status.ACCEPTED);
        pendingPub = TestUtils.newPublisher(3, "pending@pub.com", Provider.Status.PENDING);
    }

    private ProviderResponseDto dtoOf(Provider p, String type) {
        return ProviderResponseDto.builder()
                .id(p.getId())
                .email(p.getEmail())
                .status(p.getStatus())
                .type(type)
                .build();
    }

    @Test
    void getProviders_filtersByStatus() {
        when(developerRepository.findAll()).thenReturn(List.of(pendingDev, acceptedDev));
        when(publisherRepository.findAll()).thenReturn(List.of(pendingPub));
        when(developerMapper.toProviderResponseDto(pendingDev, "developer"))
                .thenReturn(dtoOf(pendingDev, "developer"));
        when(publisherMapper.toProviderResponseDto(pendingPub, "publisher"))
                .thenReturn(dtoOf(pendingPub, "publisher"));

        List<ProviderResponseDto> result = adminService.getProviders("pending", null);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(ProviderResponseDto::getId).containsExactlyInAnyOrder(1, 3);
    }

    @Test
    void getProviders_filtersByName() {
        when(developerRepository.findAll()).thenReturn(List.of(pendingDev, acceptedDev));
        when(publisherRepository.findAll()).thenReturn(List.of(pendingPub));
        when(developerMapper.toProviderResponseDto(acceptedDev, "developer"))
                .thenReturn(dtoOf(acceptedDev, "developer"));

        List<ProviderResponseDto> result = adminService.getProviders(null, "accepted");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(2);
    }

    @Test
    void getProviders_noFilter_returnsAll() {
        when(developerRepository.findAll()).thenReturn(List.of(pendingDev, acceptedDev));
        when(publisherRepository.findAll()).thenReturn(List.of(pendingPub));
        when(developerMapper.toProviderResponseDto(any(Developer.class), eq("developer")))
                .thenAnswer(inv -> dtoOf(inv.getArgument(0), "developer"));
        when(publisherMapper.toProviderResponseDto(any(Publisher.class), eq("publisher")))
                .thenAnswer(inv -> dtoOf(inv.getArgument(0), "publisher"));

        List<ProviderResponseDto> result = adminService.getProviders(null, null);

        assertThat(result).hasSize(3);
    }

    @Test
    void changeProviderStatus_developerExists_acceptsTransition() {
        when(developerRepository.existsById(1)).thenReturn(true);
        when(developerRepository.findById(1)).thenReturn(Optional.of(pendingDev));
        when(developerMapper.toProviderResponseDto(pendingDev, "developer"))
                .thenReturn(dtoOf(pendingDev, "developer"));

        ProviderResponseDto result = adminService.changeProviderStatus(1, "ACCEPTED");

        assertThat(pendingDev.getStatus()).isEqualTo(Provider.Status.ACCEPTED);
        assertThat(result.getType()).isEqualTo("developer");
        verify(developerRepository).save(pendingDev);
    }

    @Test
    void changeProviderStatus_fallsBackToPublisher() {
        when(developerRepository.existsById(3)).thenReturn(false);
        when(publisherRepository.findById(3)).thenReturn(Optional.of(pendingPub));
        when(publisherMapper.toProviderResponseDto(pendingPub, "publisher"))
                .thenReturn(dtoOf(pendingPub, "publisher"));

        ProviderResponseDto result = adminService.changeProviderStatus(3, "REJECTED");

        assertThat(pendingPub.getStatus()).isEqualTo(Provider.Status.REJECTED);
        assertThat(result.getType()).isEqualTo("publisher");
        verify(publisherRepository).save(pendingPub);
    }

    @Test
    void changeProviderStatus_unknownId_throws() {
        when(developerRepository.existsById(404)).thenReturn(false);
        when(publisherRepository.findById(404)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.changeProviderStatus(404, "ACCEPTED"))
                .isInstanceOf(NotFoundException.class);
    }
}
