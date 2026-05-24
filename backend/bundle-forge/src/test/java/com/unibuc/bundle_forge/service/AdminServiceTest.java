package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.ProviderResponseDto;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.mapper.DeveloperMapper;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.repository.DeveloperRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private DeveloperRepository developerRepository;
    @Mock private DeveloperMapper developerMapper;

    @InjectMocks
    private AdminService adminService;

    private Developer pendingDev;
    private Developer acceptedDev;

    @BeforeEach
    void setUp() {
        pendingDev  = TestUtils.newDeveloper(1, "pending@dev.com",  Provider.Status.PENDING);
        acceptedDev = TestUtils.newDeveloper(2, "accepted@dev.com", Provider.Status.ACCEPTED);
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
        when(developerMapper.toProviderResponseDto(pendingDev, "developer"))
                .thenReturn(dtoOf(pendingDev, "developer"));

        List<ProviderResponseDto> result = adminService.getProviders("pending", null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1);
    }

    @Test
    void getProviders_filtersByName() {
        when(developerRepository.findAll()).thenReturn(List.of(pendingDev, acceptedDev));
        when(developerMapper.toProviderResponseDto(acceptedDev, "developer"))
                .thenReturn(dtoOf(acceptedDev, "developer"));

        List<ProviderResponseDto> result = adminService.getProviders(null, "accepted");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(2);
    }

    @Test
    void getProviders_noFilter_returnsAll() {
        when(developerRepository.findAll()).thenReturn(List.of(pendingDev, acceptedDev));
        when(developerMapper.toProviderResponseDto(any(Developer.class), eq("developer")))
                .thenAnswer(inv -> dtoOf(inv.getArgument(0), "developer"));

        List<ProviderResponseDto> result = adminService.getProviders(null, null);

        assertThat(result).hasSize(2);
    }

    @Test
    void changeProviderStatus_acceptsTransition() {
        when(developerRepository.findById(1)).thenReturn(Optional.of(pendingDev));
        when(developerMapper.toProviderResponseDto(pendingDev, "developer"))
                .thenReturn(dtoOf(pendingDev, "developer"));

        ProviderResponseDto result = adminService.changeProviderStatus(1, "ACCEPTED");

        assertThat(pendingDev.getStatus()).isEqualTo(Provider.Status.ACCEPTED);
        assertThat(result.getType()).isEqualTo("developer");
        verify(developerRepository).save(pendingDev);
    }

    @Test
    void changeProviderStatus_unknownId_throws() {
        when(developerRepository.findById(404)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.changeProviderStatus(404, "ACCEPTED"))
                .isInstanceOf(NotFoundException.class);
    }
}
