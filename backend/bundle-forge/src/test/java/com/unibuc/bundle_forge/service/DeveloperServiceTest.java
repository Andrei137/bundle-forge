package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.DeveloperDto;
import com.unibuc.bundle_forge.mapper.DeveloperMapper;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.repository.DeveloperRepository;
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
public class DeveloperServiceTest {

    @Mock
    private DeveloperRepository developerRepository;

    @Mock
    private DeveloperMapper developerMapper;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private DeveloperService developerService;

    private Developer developer;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        developer = TestUtils.developer1;
    }

    @Test
    void getAllUsers_ShouldReturnAllDevelopers() {
        when(developerRepository.findAll()).thenReturn(TestUtils.developers);

        List<Developer> result = developerService.getRepository().findAll();

        assertNotNull(result);
        assertEquals(TestUtils.developers.size(), result.size());

        verify(developerRepository, times(1)).findAll();
    }

    @Test
    void getUserById_WhenDeveloperExists_ShouldReturnDeveloper() {
        when(developerRepository.findById(developer.getId())).thenReturn(Optional.of(developer));

        Optional<Developer> result = developerService.getRepository().findById(developer.getId());

        assertTrue(result.isPresent());
        assertEquals(developer, result.get());

        verify(developerRepository, times(1)).findById(developer.getId());
    }

    @Test
    void getUserById_WhenDeveloperDoesNotExist_ShouldReturnEmpty() {
        when(developerRepository.findById(404)).thenReturn(Optional.empty());

        Optional<Developer> result = developerService.getRepository().findById(404);

        assertTrue(result.isEmpty());

        verify(developerRepository, times(1)).findById(404);
    }

    @Test
    void getCurrentUser_ShouldReturnCurrentDeveloper() {
        when(jwtService.getCurrentUser()).thenReturn(developer);

        Developer result = developerService.getCurrentUser();

        assertNotNull(result);
        assertEquals(developer, result);


        verify(jwtService, times(1)).getCurrentUser();
    }

    @Test
    void updateLoggedUser_ShouldUpdateAndReturnDeveloper() {
        DeveloperDto developerDto = new DeveloperDto();
        when(jwtService.getCurrentUser()).thenReturn(developer);
        doNothing().when(developerMapper).updateEntityFromDto(developerDto, developer);
        when(developerRepository.save(developer)).thenReturn(developer);

        Developer result = developerService.updateLoggedUser(developerDto);

        assertNotNull(result);
        assertEquals(developer, result);

        verify(jwtService, times(1)).getCurrentUser();
        verify(developerMapper, times(1)).updateEntityFromDto(developerDto, developer);
        verify(developerRepository, times(1)).save(developer);
    }
}
