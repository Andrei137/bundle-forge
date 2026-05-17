package com.unibuc.bundle_forge.integration;

import com.unibuc.bundle_forge.model.Tag;
import com.unibuc.bundle_forge.repository.TagRepository;
import com.unibuc.bundle_forge.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
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
class TagIntegrationTest {

    @Autowired private WebApplicationContext context;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private TagRepository tagRepository;
    @Autowired private JwtService jwtService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        tagRepository.deleteAll();
    }

    @Test
    void listTags_emptyThenCreatedByAdmin_thenListed() throws Exception {
        // 1) listing tags initially returns empty
        mockMvc.perform(get("/tags"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        // 2) creating a tag unauthenticated → 401
        mockMvc.perform(post("/tags")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "indie"))))
                .andExpect(status().isUnauthorized());

        // 3) admin can create
        String adminToken = jwtService.getToken("admin");
        mockMvc.perform(post("/tags")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "indie"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("indie"));

        // 4) tag persisted
        assertThat(tagRepository.findByName("indie")).isPresent();

        // 5) duplicate creation → 400
        mockMvc.perform(post("/tags")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "indie"))))
                .andExpect(status().isBadRequest());

        // 6) listing tags returns it
        mockMvc.perform(get("/tags"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("indie"));
    }

    @Test
    void createTag_blankName_returnsBadRequest() throws Exception {
        String adminToken = jwtService.getToken("admin");
        mockMvc.perform(post("/tags")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "   "))))
                .andExpect(status().isBadRequest());
    }
}
