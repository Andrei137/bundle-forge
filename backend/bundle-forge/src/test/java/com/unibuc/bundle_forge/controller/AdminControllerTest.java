package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.dto.ProviderResponseDto;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.service.AdminService;
import com.unibuc.bundle_forge.service.JwtService;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
public class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void getProviders_ShouldReturnProviders() throws Exception {
        Mockito.when(adminService.getProviders(null, null)).thenReturn(TestUtils.providerDtos);
        var result = mockMvc.perform(get("/admin/providers")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(TestUtils.providerDtos.size()));

        for (int i = 0; i < TestUtils.providerDtos.size(); i++) {
            TestUtils.assertProviderDto(result, "[" + i + "]", TestUtils.providerDtos.get(i));
        }
    }

    @Test
    void getProviders_ShouldReturnProvidersFilteredByName() throws Exception {
        String nameFilter = "developer";
        List<ProviderResponseDto> providers = TestUtils.providerDtos
                .stream()
                .filter(p -> p.getUsername().toLowerCase().contains(nameFilter))
                .toList();
        Mockito.when(adminService.getProviders(null, nameFilter)).thenReturn(providers);

        var result = mockMvc.perform(get(String.format("/admin/providers?name=%s", nameFilter))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(providers.size()));

        for (int i = 0; i < providers.size(); i++) {
            TestUtils.assertProviderDto(result, "[" + i + "]", providers.get(i));
        }
    }

    @Test
    void changeStatusPublisher_ShouldReturnUpdatedProvider() throws Exception {
        ProviderResponseDto updatedPublisher = ProviderResponseDto.builder()
                .id(TestUtils.publisherDto.getId())
                .username(TestUtils.publisherDto.getUsername())
                .email(TestUtils.publisherDto.getEmail())
                .status(Provider.Status.REJECTED)
                .website(TestUtils.publisherDto.getWebsite())
                .type(TestUtils.publisherDto.getType())
                .build();

        Mockito.when(adminService.changeProviderStatus(TestUtils.publisherDto.getId(), "rejected"))
                .thenReturn(updatedPublisher);

        var result = mockMvc.perform(put(String.format("/admin/providers/%d", TestUtils.publisherDto.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"status\": \"rejected\" }")
                )
                .andExpect(status().isOk());

        TestUtils.assertProviderDto(result, "", updatedPublisher);

    }

}