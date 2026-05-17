package com.unibuc.bundle_forge.service;

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
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeveloperServiceTest {

    @Mock private DeveloperRepository developerRepository;
    @Mock private DeveloperMapper developerMapper;
    @Mock private JwtService jwtService;

    @InjectMocks
    private DeveloperService developerService;

    private Developer dev;

    @BeforeEach
    void setUp() {
        dev = TestUtils.newDeveloper(1, "d@test.com", Provider.Status.ACCEPTED);
        ReflectionTestUtils.setField(developerService, "developerRepository", developerRepository);
        ReflectionTestUtils.setField(developerService, "developerMapper", developerMapper);
        ReflectionTestUtils.setField(developerService, "jwtService", jwtService);
    }

    @Test
    void getProvidersByStatus_delegates() {
        when(developerRepository.findByStatus(Provider.Status.ACCEPTED)).thenReturn(List.of(dev));
        assertThat(developerService.getProvidersByStatus(Provider.Status.ACCEPTED)).containsExactly(dev);
    }

    @Test
    void getProviderByIdAndStatus_found() {
        when(developerRepository.findByIdAndStatus(1, Provider.Status.ACCEPTED)).thenReturn(Optional.of(dev));
        assertThat(developerService.getProviderByIdAndStatus(1, Provider.Status.ACCEPTED)).isSameAs(dev);
    }

    @Test
    void getProviderByIdAndStatus_missing_throws() {
        when(developerRepository.findByIdAndStatus(99, Provider.Status.ACCEPTED)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> developerService.getProviderByIdAndStatus(99, Provider.Status.ACCEPTED))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("developer");
    }
}
