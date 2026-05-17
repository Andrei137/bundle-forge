package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.mapper.PublisherMapper;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.repository.PublisherRepository;
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
class PublisherServiceTest {

    @Mock private PublisherRepository publisherRepository;
    @Mock private PublisherMapper publisherMapper;
    @Mock private JwtService jwtService;

    @InjectMocks
    private PublisherService publisherService;

    private Publisher pub;

    @BeforeEach
    void setUp() {
        pub = TestUtils.newPublisher(1, "p@test.com", Provider.Status.ACCEPTED);
        ReflectionTestUtils.setField(publisherService, "publisherRepository", publisherRepository);
        ReflectionTestUtils.setField(publisherService, "publisherMapper", publisherMapper);
        ReflectionTestUtils.setField(publisherService, "jwtService", jwtService);
    }

    @Test
    void getProvidersByStatus_delegates() {
        when(publisherRepository.findByStatus(Provider.Status.PENDING)).thenReturn(List.of(pub));
        assertThat(publisherService.getProvidersByStatus(Provider.Status.PENDING)).containsExactly(pub);
    }

    @Test
    void getProviderByIdAndStatus_found() {
        when(publisherRepository.findByIdAndStatus(1, Provider.Status.ACCEPTED)).thenReturn(Optional.of(pub));
        assertThat(publisherService.getProviderByIdAndStatus(1, Provider.Status.ACCEPTED)).isSameAs(pub);
    }

    @Test
    void getProviderByIdAndStatus_missing_throws() {
        when(publisherRepository.findByIdAndStatus(99, Provider.Status.ACCEPTED)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> publisherService.getProviderByIdAndStatus(99, Provider.Status.ACCEPTED))
                .isInstanceOf(NotFoundException.class);
    }
}
