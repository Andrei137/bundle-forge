package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.ContractDto;
import com.unibuc.bundle_forge.dto.GameCreateDto;
import com.unibuc.bundle_forge.dto.GameResponseDto;
import com.unibuc.bundle_forge.dto.GameUpdateDto;
import com.unibuc.bundle_forge.exception.ForbiddenException;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.mapper.GameMapper;
import com.unibuc.bundle_forge.model.Contract;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.repository.ContractRepository;
import com.unibuc.bundle_forge.repository.GameRepository;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GameServiceTest {

    @Mock
    private GameRepository gameRepository;

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private GameMapper gameMapper;

    @InjectMocks
    private GameService gameService;

    private Developer developer;
    private Publisher publisher;
    private Game game;

    @BeforeEach
    void setUp() {
        developer = TestUtils.developer1;
        publisher = TestUtils.publisher1;
        game = TestUtils.game1.toBuilder()
                .developer(developer)
                .status(Game.Status.PUBLISHED)
                .contracts(new ArrayList<>())
                .build();
    }

    @Test
    void getGame_ExistingGame_ShouldReturnGame() {
        when(gameRepository.findById(game.getId())).thenReturn(Optional.of(game));

        Game result = gameService.getGame(game.getId());

        assertNotNull(result);
        assertEquals(game, result);
    }

    @Test
    void getGame_NonExistingGame_ShouldThrowNotFoundException() {
        when(gameRepository.findById(404)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gameService.getGame(404))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Game with id 404 not found");
    }

    @Test
    void getAllGamesOfCurrentProvider_ForDeveloper_ShouldFilterByStatusAndTitle() {
        when(jwtService.getCurrentProvider()).thenReturn(developer);
        when(gameRepository.getGamesByDeveloperId(developer.getId())).thenReturn(List.of(game));

        List<GameResponseDto> result = gameService.getAllGamesOfCurrentProvider("announced", "Game One");

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void announceGame_ShouldSetDeveloperAndReturnDto() {
        GameCreateDto createDto = new GameCreateDto();
        when(jwtService.getCurrentProvider()).thenReturn(developer);
        when(gameMapper.toEntity(createDto)).thenReturn(game);
        when(gameRepository.save(game)).thenReturn(game);
        when(gameMapper.toResponseDto(game)).thenReturn(TestUtils.gameDto1);

        GameResponseDto result = gameService.announceGame(createDto);

        assertNotNull(result);
        assertEquals(TestUtils.gameDto1, result);
        assertEquals(developer, game.getDeveloper());
    }

    @Test
    void updateGame_WithPermission_ShouldUpdateGame() {
        GameUpdateDto updateDto = new GameUpdateDto();
        when(gameRepository.findById(game.getId())).thenReturn(Optional.of(game));
        when(jwtService.getCurrentProvider()).thenReturn(developer);
        when(gameRepository.save(game)).thenReturn(game);
        when(gameMapper.toResponseDto(game)).thenReturn(TestUtils.gameDto1);

        GameResponseDto result = gameService.updateGame(game.getId(), updateDto);

        assertNotNull(result);
        verify(gameMapper, times(1)).updateEntityFromDto(updateDto, game);
    }

    @Test
    void updateGame_NotOwner_ShouldThrowForbiddenException() {
        GameUpdateDto updateDto = new GameUpdateDto();
        when(gameRepository.findById(game.getId())).thenReturn(Optional.of(game));
        when(jwtService.getCurrentProvider()).thenReturn(TestUtils.developer2);

        assertThatThrownBy(() -> gameService.updateGame(game.getId(), updateDto))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Not enough permissions");
    }

    @Test
    void getGameContracts_DeveloperOwnsGame_ShouldReturnContracts() {
        when(gameRepository.findById(game.getId())).thenReturn(Optional.of(game));
        when(jwtService.getCurrentProvider()).thenReturn(developer);

        List<Contract> result = gameService.getGameContracts(game.getId());

        assertEquals(game.getContracts(), result);
    }

    @Test
    void getGameContracts_NotOwner_ShouldThrowForbiddenException() {
        when(gameRepository.findById(game.getId())).thenReturn(Optional.of(game));
        when(jwtService.getCurrentProvider()).thenReturn(TestUtils.developer2);

        assertThatThrownBy(() -> gameService.getGameContracts(game.getId()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void updateContractStatus_Valid_ShouldSaveContract() {
        ContractDto contractDto = new ContractDto();
        Contract contract = Contract.builder().build();

        when(gameRepository.findById(game.getId())).thenReturn(Optional.of(game));
        when(jwtService.getCurrentProvider()).thenReturn(developer);
        when(contractRepository.getContractByPublisherIdAndGameId(publisher.getId(), game.getId()))
                .thenReturn(contract);
        when(contractRepository.save(contract)).thenReturn(contract);

        Contract result = gameService.updateContractStatus(game.getId(), publisher.getId(), contractDto);

        assertNotNull(result);
        verify(contractRepository, times(1)).save(contract);
    }

    @Test
    void updateContractStatus_ContractNotFound_ShouldThrowNotFoundException() {
        ContractDto contractDto = new ContractDto();

        when(gameRepository.findById(game.getId())).thenReturn(Optional.of(game));
        when(jwtService.getCurrentProvider()).thenReturn(developer);
        when(contractRepository.getContractByPublisherIdAndGameId(publisher.getId(), game.getId()))
                .thenReturn(null);

        assertThatThrownBy(() -> gameService.updateContractStatus(game.getId(), publisher.getId(), contractDto))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("No contract found");
    }
}
