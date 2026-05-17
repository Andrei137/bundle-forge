package com.unibuc.bundle_forge.integration;

import com.unibuc.bundle_forge.dto.CharityFounderCreateDto;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.repository.CharityFounderRepository;
import com.unibuc.bundle_forge.repository.CustomerRepository;
import com.unibuc.bundle_forge.service.JwtService;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Import(IntegrationTestConfig.class)
@ActiveProfiles("test")
class CharityFounderIntegrationTest {

    @Autowired private WebApplicationContext context;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private CharityFounderRepository charityFounderRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private JwtService jwtService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        charityFounderRepository.deleteAll();
        customerRepository.deleteAll();
    }

    private CharityFounderCreateDto sampleDto(String name) {
        CharityFounderCreateDto dto = new CharityFounderCreateDto();
        dto.setName(name);
        dto.setWebsite("https://charity.test");
        dto.setShortDescription("short");
        dto.setLongDescription("long body");
        return dto;
    }

    @Test
    void crudFlow_anonymousReadsAdminWrites() throws Exception {
        // 1) anonymous list returns empty
        mockMvc.perform(get("/charity-founders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        // 2) anonymous create → 401
        mockMvc.perform(post("/charity-founders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleDto("HopeOrg"))))
                .andExpect(status().isUnauthorized());

        // 3) admin create succeeds
        String adminToken = jwtService.getToken("admin");
        MvcResult result = mockMvc.perform(post("/charity-founders")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleDto("HopeOrg"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("HopeOrg"))
                .andExpect(jsonPath("$.id").exists())
                .andReturn();

        Integer createdId = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("id").asInt();
        assertThat(charityFounderRepository.findById(createdId)).isPresent();

        // 4) anonymous get by id returns it
        mockMvc.perform(get("/charity-founders/" + createdId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(createdId))
                .andExpect(jsonPath("$.shortDescription").value("short"));

        // 5) update by admin
        CharityFounderCreateDto updated = sampleDto("HopeOrg Updated");
        mockMvc.perform(put("/charity-founders/" + createdId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("HopeOrg Updated"));

        // 6) non-admin user cannot delete
        Customer customer = customerRepository.save(Customer.builder()
                .email("ann@test.com")
                .password(JwtService.encryptPassword("Secret__123"))
                .firstName("Ann").lastName("N").phoneNumber("0700000123")
                .build());
        String customerToken = jwtService.getToken(String.valueOf(customer.getId()));
        mockMvc.perform(delete("/charity-founders/" + createdId)
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isUnauthorized());

        // 7) admin delete succeeds
        mockMvc.perform(delete("/charity-founders/" + createdId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        assertThat(charityFounderRepository.findById(createdId)).isEmpty();
    }

    @Test
    void getById_unknown_returns404() throws Exception {
        mockMvc.perform(get("/charity-founders/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_invalidBody_returnsBadRequest() throws Exception {
        String adminToken = jwtService.getToken("admin");
        CharityFounderCreateDto invalid = new CharityFounderCreateDto();
        invalid.setName(""); // blank required
        invalid.setShortDescription("");
        invalid.setLongDescription("");

        mockMvc.perform(post("/charity-founders")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }
}
