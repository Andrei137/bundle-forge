package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.service.JwtService;
import com.unibuc.bundle_forge.service.LibraryService;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LibraryController.class)
public class LibraryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LibraryService libraryService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void getAllGames_ShouldReturnListOfOwnedGames() throws Exception {
        Mockito.when(libraryService.getOwnedGames()).thenReturn(TestUtils.games);

        var result = mockMvc.perform(get("/library")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(TestUtils.games.size()));

        for (int i = 0; i < TestUtils.games.size(); i++) {
            TestUtils.assertGame(result, "[" + i + "]", TestUtils.games.get(i));
        }
    }

    @Test
    void getGameById_ShouldReturnOwnedGame() throws Exception {
        Mockito.when(libraryService.getOwnedGameById(TestUtils.game1.getId()))
                .thenReturn(TestUtils.game1);

        var result = mockMvc.perform(get(String.format("/library/%d", TestUtils.game1.getId()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        TestUtils.assertGame(result, "", TestUtils.game1);
    }

}