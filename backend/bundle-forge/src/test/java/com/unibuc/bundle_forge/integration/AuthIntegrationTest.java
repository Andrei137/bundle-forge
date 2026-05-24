package com.unibuc.bundle_forge.integration;

import com.unibuc.bundle_forge.dto.CredentialsDto;
import com.unibuc.bundle_forge.dto.CustomerDto;
import com.unibuc.bundle_forge.dto.EmailCheckDto;
import com.unibuc.bundle_forge.repository.CustomerRepository;
import com.unibuc.bundle_forge.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Import(IntegrationTestConfig.class)
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired private WebApplicationContext context;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private CustomerRepository customerRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        customerRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void signup_thenSignin_thenAccessProtectedMe() throws Exception {
        // 1) check email free
        mockMvc.perform(post("/auth/check-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EmailCheckDto("alice@test.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(false));

        // 2) signup
        CustomerDto signup = CustomerDto.builder()
                .email("alice@test.com")
                .password("Secret__123")
                .firstName("Alice")
                .lastName("Smith")
                .phoneNumber("0712345678")
                .build();
        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("alice@test.com"));

        assertThat(userRepository.findByEmail("alice@test.com")).isNotNull();

        // 3) check email now taken
        mockMvc.perform(post("/auth/check-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EmailCheckDto("alice@test.com"))))
                .andExpect(jsonPath("$.exists").value(true));

        // 4) signin
        MvcResult signinResult = mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CredentialsDto("alice@test.com", "Secret__123", false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.userType").value("CUSTOMER"))
                .andExpect(jsonPath("$.blocked").value(false))
                .andReturn();

        Map<?, ?> body = objectMapper.readValue(
                signinResult.getResponse().getContentAsString(), Map.class);
        String token = (String) body.get("token");
        assertThat(token).isNotBlank();

        // 5) authenticated request to /customers/me → 200
        mockMvc.perform(get("/customers/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alice@test.com"))
                .andExpect(jsonPath("$.firstName").value("Alice"));
    }

    @Test
    void signin_invalidPassword_returnsBadRequest() throws Exception {
        // create a user first
        CustomerDto signup = CustomerDto.builder()
                .email("bob@test.com")
                .password("Secret__123")
                .firstName("Bob")
                .lastName("Brown")
                .phoneNumber("0712341111")
                .build();
        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CredentialsDto("bob@test.com", "wrong-password", false))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void signup_duplicatePhone_returnsBadRequest() throws Exception {
        CustomerDto first = CustomerDto.builder()
                .email("c1@test.com").password("Secret__123")
                .firstName("C").lastName("One").phoneNumber("0712345555").build();
        CustomerDto second = CustomerDto.builder()
                .email("c2@test.com").password("Secret__123")
                .firstName("C").lastName("Two").phoneNumber("0712345555").build();

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(second)))
                .andExpect(status().isBadRequest());
    }
}
