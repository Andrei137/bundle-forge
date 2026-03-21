package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.dto.DeveloperDto;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.service.DeveloperService;
import com.unibuc.bundle_forge.service.JwtService;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DeveloperController.class)
public class DeveloperControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DeveloperService developerService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void getAllDevelopers_ShouldReturnListOfDevelopers() throws Exception {
        Mockito.when(developerService.getProvidersByStatus(Provider.Status.ACCEPTED))
                .thenReturn(TestUtils.developers);

        var result = mockMvc.perform(get("/developers")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(TestUtils.developers.size()));

        for (int i = 0; i < TestUtils.developers.size(); i++) {
            TestUtils.assertDeveloper(result, "[" + i + "]", TestUtils.developers.get(i));
        }
    }

    @Test
    void getCurrentDeveloper_ShouldReturnDeveloper() throws Exception {
        Mockito.when(developerService.getCurrentUser()).thenReturn(TestUtils.developer1);

        var result = mockMvc.perform(get("/developers/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        TestUtils.assertDeveloper(result, "", TestUtils.developer1);
    }

    @Test
    void getDeveloperById_ShouldReturnDeveloper() throws Exception {
        Mockito.when(developerService.getProviderByIdAndStatus(TestUtils.developer1.getId(), Provider.Status.ACCEPTED))
                .thenReturn(TestUtils.developer1);

        var result = mockMvc.perform(get(String.format("/developers/%d", TestUtils.developer1.getId()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        TestUtils.assertDeveloper(result, "", TestUtils.developer1);
    }

    @Test
    void updateDeveloper_ShouldReturnUpdatedDeveloper() throws Exception {
        DeveloperDto developerDto = DeveloperDto.builder()
                .website("https://new-website.com")
                .build();
        Developer updatedDeveloper = Developer.builder()
                .id(TestUtils.developer1.getId())
                .username(TestUtils.developer1.getUsername())
                .password(TestUtils.developer1.getPassword())
                .email(TestUtils.developer1.getEmail())
                .website(TestUtils.developer1.getWebsite())
                .build();

        Mockito.when(developerService.updateLoggedUser(developerDto)).thenReturn(updatedDeveloper);

        var result = mockMvc.perform(put("/developers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(developerDto)))
                .andExpect(status().isOk());

        TestUtils.assertDeveloper(result, "", updatedDeveloper);
    }

}