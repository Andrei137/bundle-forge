package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.dto.CredentialsDto;
import com.unibuc.bundle_forge.dto.CustomerDto;
import com.unibuc.bundle_forge.dto.DeveloperDto;
import com.unibuc.bundle_forge.dto.PublisherDto;
import com.unibuc.bundle_forge.dto.TokenDto;
import com.unibuc.bundle_forge.service.AuthService;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void signin_ShouldReturnToken() throws Exception {
        CredentialsDto credentials = CredentialsDto
                .builder()
                .username("user")
                .password("password")
                .build();
        TokenDto tokenDto = TokenDto.builder().token("jwt-token").build();

        Mockito.when(authService.signin(credentials))
                .thenReturn(tokenDto);

        mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(credentials)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @Test
    void signupCustomer_ShouldReturnCustomer() throws Exception {
        CustomerDto customerDto = CustomerDto.builder()
                .username(TestUtils.customer1.getUsername())
                .password(TestUtils.password)
                .email(TestUtils.customer1.getEmail())
                .lastName(TestUtils.customer1.getLastName())
                .firstName(TestUtils.customer1.getFirstName())
                .phoneNumber(TestUtils.customer1.getPhoneNumber())
                .build();

        Mockito.when(authService.signupCustomer(customerDto)).thenReturn(TestUtils.customer1);

        var result = mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customerDto)))
                .andExpect(status().isCreated());
        TestUtils.assertCustomer(result, "", TestUtils.customer1);
    }

    @Test
    void requestDeveloper_ShouldReturnDeveloper() throws Exception {
        DeveloperDto developerDto = DeveloperDto.builder()
                .username(TestUtils.developer1.getUsername())
                .password(TestUtils.password)
                .email(TestUtils.developer1.getEmail())
                .website(TestUtils.developer1.getWebsite())
                .build();

        Mockito.when(authService.registerDeveloper(developerDto)).thenReturn(TestUtils.developer1);

        var result = mockMvc.perform(post("/auth/request/developer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(developerDto)))
                .andExpect(status().isCreated());
        TestUtils.assertDeveloper(result, "", TestUtils.developer1);
    }

    @Test
    void requestPublisher_ShouldReturnPublisher() throws Exception {
        PublisherDto publisherDto = PublisherDto.builder()
                .username(TestUtils.publisher1.getUsername())
                .password(TestUtils.password)
                .email(TestUtils.publisher1.getEmail())
                .website(TestUtils.publisher1.getWebsite())
                .build();

        Mockito.when(authService.registerPublisher(publisherDto)).thenReturn(TestUtils.publisher1);

        var result = mockMvc.perform(post("/auth/request/publisher")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(publisherDto)))
                .andExpect(status().isCreated());
        TestUtils.assertPublisher(result, "", TestUtils.publisher1);
    }

}