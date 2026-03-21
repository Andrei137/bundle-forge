package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.dto.ContractDto;
import com.unibuc.bundle_forge.dto.GameCreateDto;
import com.unibuc.bundle_forge.dto.GameResponseDto;
import com.unibuc.bundle_forge.dto.GameUpdateDto;
import com.unibuc.bundle_forge.model.Contract;
import com.unibuc.bundle_forge.service.GameService;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GameController.class)
public class GameControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private GameService gameService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void getAllGames_ShouldReturnGames() throws Exception {
        Mockito.when(gameService.getAllGamesOfCurrentProvider(null, null))
                .thenReturn(TestUtils.gameDtos);

        var result = mockMvc.perform(get("/games"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(TestUtils.gameDtos.size()));

        for (int i = 0; i < TestUtils.gameDtos.size(); i++) {
            TestUtils.assertGameDto(result, "[" + i + "]", TestUtils.gameDtos.get(i));
        }
    }

    @Test
    void announceGame_ShouldReturnCreatedGame() throws Exception {
        GameCreateDto gameDto = GameCreateDto.builder()
                .title(TestUtils.gameDto1.getTitle())
                .price(TestUtils.gameDto1.getPrice())
                .build();

        Mockito.when(gameService.announceGame(gameDto))
                .thenReturn(TestUtils.gameDto1);

        var result = mockMvc.perform(post("/games")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(gameDto)))
                .andExpect(status().isCreated());
        TestUtils.assertGameDto(result, "", TestUtils.gameDto1);
    }

    @Test
    void updateGame_ShouldReturnUpdatedGame() throws Exception {
        GameUpdateDto gameDto = GameUpdateDto.builder()
                .discountPercentage(20)
                .build();
        GameResponseDto updatedGame = GameResponseDto.builder()
                .id(TestUtils.gameDto1.getId())
                .title(TestUtils.gameDto1.getTitle())
                .price(TestUtils.gameDto1.getPrice())
                .releaseDate(TestUtils.gameDto1.getReleaseDate())
                .discountPercentage(gameDto.getDiscountPercentage())
                .build();

        Mockito.when(gameService.updateGame(updatedGame.getId(), gameDto))
                .thenReturn(updatedGame);

        var result = mockMvc.perform(put(String.format("/games/%d", TestUtils.gameDto1.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(gameDto)))
                .andExpect(status().isCreated());
        TestUtils.assertGameDto(result, "", updatedGame);
    }

    @Test
    void getContracts_ShouldReturnContracts() throws Exception {
        Mockito.when(gameService.getGameContracts(TestUtils.gameDto1.getId()))
                .thenReturn(TestUtils.contracts);

        var result = mockMvc.perform(get(String.format("/games/%d/contracts", TestUtils.gameDto1.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(TestUtils.contracts.size()));
        for (int i = 0; i < TestUtils.contracts.size(); i++) {
            TestUtils.assertContract(result, "[" + i + "]", TestUtils.contracts.get(i));
        }
    }

    @Test
    void acceptContract_ShouldReturnUpdatedContract() throws Exception {
        ContractDto contractDto = ContractDto.builder()
                .status("accepted")
                .build();

        Contract updatedContract = Contract.builder()
                .id(TestUtils.contract1.getId())
                .status(Contract.Status.ACCEPTED)
                .expiryDate(TestUtils.contract1.getExpiryDate())
                .cutPercentage(TestUtils.contract1.getCutPercentage())
                .build();

        Mockito.when(
                gameService.updateContractStatus(
                        TestUtils.contract1.getId().getGameId(),
                        TestUtils.contract1.getId().getPublisherId(),
                        contractDto
                )
        ).thenReturn(updatedContract);

        String endpoint = String.format(
                "/games/%d/contracts/%d",
                TestUtils.contract1.getId().getGameId(),
                TestUtils.contract1.getId().getPublisherId()
        );
        var result = mockMvc.perform(put(endpoint)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(contractDto)))
                .andExpect(status().isOk());
        TestUtils.assertContract(result, "", updatedContract);
    }

}

