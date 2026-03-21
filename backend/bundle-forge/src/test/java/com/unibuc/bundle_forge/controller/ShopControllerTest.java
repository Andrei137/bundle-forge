package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.service.JwtService;
import com.unibuc.bundle_forge.service.ShopService;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ShopController.class)
public class ShopControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ShopService shopService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void getShop_ShouldReturnListOfGames() throws Exception {
        Mockito.when(shopService.getUnownedGames()).thenReturn(TestUtils.gameDtos);

        var result = mockMvc.perform(get("/shop")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(TestUtils.gameDtos.size()));

        for (int i = 0; i < TestUtils.gameDtos.size(); i++) {
            TestUtils.assertGameDto(result, "[" + i + "]", TestUtils.gameDtos.get(i));
        }
    }

    @Test
    void getGameInShop_ShouldReturnGame() throws Exception {
        Mockito.when(shopService.getUnownedGameById(TestUtils.gameDto1.getId())).thenReturn(TestUtils.gameDto1);

        var result = mockMvc.perform(get(String.format("/shop/%d", TestUtils.gameDto1.getId()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        TestUtils.assertGameDto(result, "", TestUtils.gameDto1);
    }

    @Test
    void buyGame_ShouldReturnNoContent() throws Exception {
        Mockito.doNothing().when(shopService).buyGame(TestUtils.gameDto1.getId());

        mockMvc.perform(post((String.format("/shop/%d/buy", TestUtils.gameDto1.getId())))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }

}