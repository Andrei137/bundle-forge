package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.PublisherDto;
import com.unibuc.bundle_forge.mapper.PublisherMapper;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.repository.PublisherRepository;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PublisherServiceTest {

    @Mock
    private PublisherRepository publisherRepository;

    @Mock
    private PublisherMapper publisherMapper;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private PublisherService publisherService;

    private Publisher publisher;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        publisher = TestUtils.publisher1;
    }

    @Test
    void getAllUsers_ShouldReturnAllDevelopers() {
        when(publisherRepository.findAll()).thenReturn(TestUtils.publishers);

        List<Publisher> result = publisherService.getRepository().findAll();

        assertNotNull(result);
        assertEquals(TestUtils.developers.size(), result.size());

        verify(publisherRepository, times(1)).findAll();
    }

    @Test
    void getUserById_WhenDeveloperExists_ShouldReturnDeveloper() {
        when(publisherRepository.findById(publisher.getId())).thenReturn(Optional.of(publisher));

        Optional<Publisher> result = publisherService.getRepository().findById(publisher.getId());

        assertTrue(result.isPresent());
        assertEquals(publisher, result.get());

        verify(publisherRepository, times(1)).findById(publisher.getId());
    }

    @Test
    void getUserById_WhenDeveloperDoesNotExist_ShouldReturnEmpty() {
        when(publisherRepository.findById(404)).thenReturn(Optional.empty());

        Optional<Publisher> result = publisherService.getRepository().findById(404);

        assertTrue(result.isEmpty());

        verify(publisherRepository, times(1)).findById(404);
    }

    @Test
    void getCurrentUser_ShouldReturnCurrentDeveloper() {
        when(jwtService.getCurrentUser()).thenReturn(publisher);

        Publisher result = publisherService.getCurrentUser();

        assertNotNull(result);
        assertEquals(publisher, result);


        verify(jwtService, times(1)).getCurrentUser();
    }

    @Test
    void updateLoggedUser_ShouldUpdateAndReturnDeveloper() {
        PublisherDto publisherDto = new PublisherDto();
        when(jwtService.getCurrentUser()).thenReturn(publisher);
        doNothing().when(publisherMapper).updateEntityFromDto(publisherDto, publisher);
        when(publisherRepository.save(publisher)).thenReturn(publisher);

        Publisher result = publisherService.updateLoggedUser(publisherDto);

        assertNotNull(result);
        assertEquals(publisher, result);

        verify(jwtService, times(1)).getCurrentUser();
        verify(publisherMapper, times(1)).updateEntityFromDto(publisherDto, publisher);
        verify(publisherRepository, times(1)).save(publisher);
    }
}
