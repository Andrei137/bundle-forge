package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.dto.PublisherDto;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.service.JwtService;
import com.unibuc.bundle_forge.service.PublisherService;
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

@WebMvcTest(PublisherController.class)
public class PublisherControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PublisherService publisherService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void getAllPublishers_ShouldReturnListOfPublishers() throws Exception {
        Mockito.when(publisherService.getProvidersByStatus(Provider.Status.ACCEPTED)).thenReturn(TestUtils.publishers);

        var result = mockMvc.perform(get("/publishers")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(TestUtils.publishers.size()));

        for (int i = 0; i < TestUtils.publishers.size(); i++) {
            TestUtils.assertPublisher(result, "[" + i + "]", TestUtils.publishers.get(i));
        }
    }

    @Test
    void getCurrentPublisher_ShouldReturnPublisher() throws Exception {
        Mockito.when(publisherService.getCurrentUser()).thenReturn(TestUtils.publisher1);

        var result = mockMvc.perform(get("/publishers/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        TestUtils.assertPublisher(result, "", TestUtils.publisher1);
    }

    @Test
    void getPublisherById_ShouldReturnPublisher() throws Exception {
        Mockito.when(publisherService.getProviderByIdAndStatus(TestUtils.publisher1.getId(), Provider.Status.ACCEPTED))
                .thenReturn(TestUtils.publisher1);

        var result = mockMvc.perform(get(String.format("/publishers/%d", TestUtils.publisher1.getId()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        TestUtils.assertPublisher(result, "", TestUtils.publisher1);
    }

    @Test
    void updatePublisher_ShouldReturnUpdatedPublisher() throws Exception {
        PublisherDto publisherDto = PublisherDto.builder()
                .website("https://new-website.com")
                .build();
        Publisher updatedPublisher = Publisher.builder()
                .id(TestUtils.publisher1.getId())
                .username(TestUtils.publisher1.getUsername())
                .password(TestUtils.publisher1.getPassword())
                .email(TestUtils.publisher1.getEmail())
                .website(TestUtils.publisher1.getWebsite())
                .build();

        Mockito.when(publisherService.updateLoggedUser(publisherDto)).thenReturn(updatedPublisher);

        var result = mockMvc.perform(put("/publishers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(publisherDto)))
                .andExpect(status().isOk());

        TestUtils.assertPublisher(result, "", updatedPublisher);
    }

}