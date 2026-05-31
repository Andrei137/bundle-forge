package com.unibuc.bundle_forge.integration;

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

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Import(IntegrationTestConfig.class)
@ActiveProfiles("test")
class GlobalExceptionHandlerIntegrationTest {

    @Autowired private WebApplicationContext context;
    @Autowired private JwtService jwtService;

    private MockMvc mockMvc;
    private String adminToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        adminToken = jwtService.getToken("admin");
    }

    @Test
    void badPathVariableType_returns400WithJsonErrorBody() throws Exception {
        // Path variable is declared as Integer; "abc" cannot be coerced.
        mockMvc.perform(get("/charity-founders/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(org.hamcrest.Matchers.containsString("Integer")));
    }

    @Test
    void malformedJsonBody_returns400() throws Exception {
        mockMvc.perform(post("/charity-founders")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ this is not valid json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void wrongMediaType_returns415() throws Exception {
        mockMvc.perform(post("/charity-founders")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("hello"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.error").value(
                        org.hamcrest.Matchers.containsString("text/plain")));
    }

    @Test
    void wrongHttpMethod_returns405() throws Exception {
        // PATCH is not mapped on /charity-founders/{id}; admin token bypasses auth.
        mockMvc.perform(patch("/charity-founders/1")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.error").value(
                        org.hamcrest.Matchers.containsString("PATCH")));
    }

    @Test
    void unknownEndpointForAuthenticatedUser_returns404() throws Exception {
        // With admin token, the request clears security and reaches the
        // dispatcher, which raises NoResourceFoundException -> 404.
        mockMvc.perform(get("/this-endpoint-does-not-exist")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());
    }
}
