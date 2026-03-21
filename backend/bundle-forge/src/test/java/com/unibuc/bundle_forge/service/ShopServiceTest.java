package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.GameResponseDto;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.mapper.GameMapper;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.repository.CustomerRepository;
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

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ShopServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private GameRepository gameRepository;

    @Mock
    private GameService gameService;

    @Mock
    private JwtService jwtService;

    @Mock
    private GameMapper gameMapper;

    @InjectMocks
    private ShopService shopService;

    private Game game1, game2;
    private GameResponseDto gameDto2;
    private Customer customer;

    @BeforeEach
    void setUp() {
        game1 = TestUtils.game1;
        game2 = TestUtils.game2;
        gameDto2 = TestUtils.gameDto2;
        customer = TestUtils.customer1.toBuilder()
                .ownedGames(new ArrayList<>(List.of(game1)))
                .build();

        when(jwtService.getCurrentCustomer()).thenReturn(customer);
    }

    @Test
    void getUnownedGames_ShouldReturnOnlyUnownedPublishedGames() {
        Game unpublishedGame = game2.toBuilder()
                .title("Unpublished Game")
                .status(Game.Status.DEVELOPED)
                .build();

        Game publishedGame = game2.toBuilder()
                .status(Game.Status.PUBLISHED)
                .build();

        when(gameRepository.findAll()).thenReturn(List.of(game1, publishedGame, unpublishedGame));
        when(gameMapper.toResponseDto(publishedGame)).thenReturn(gameDto2);

        List<GameResponseDto> result = shopService.getUnownedGames();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(gameDto2, result.getFirst());

        verify(gameRepository, times(1)).findAll();
        verify(gameMapper, times(1)).toResponseDto(publishedGame);
    }

    @Test
    void getUnownedGameById_ExistingUnownedGame_ShouldReturnDto() {
        Game publishedGame = game2.toBuilder()
                .status(Game.Status.PUBLISHED)
                .build();

        when(gameRepository.findAll()).thenReturn(List.of(game1, publishedGame));
        when(gameMapper.toResponseDto(publishedGame)).thenReturn(gameDto2);

        GameResponseDto dto = shopService.getUnownedGameById(publishedGame.getId());

        assertNotNull(dto);
        assertEquals(gameDto2, dto);

        verify(gameRepository, times(1)).findAll();
        verify(gameMapper, times(1)).toResponseDto(publishedGame);
    }

    @Test
    void getUnownedGameById_OwnedGame_ShouldThrowNotFoundException() {
        when(gameRepository.findAll()).thenReturn(List.of(game1, game2));

        assertThatThrownBy(() -> shopService.getUnownedGameById(game1.getId()))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Game at id 1 owned or doesn't exist");
    }

    @Test
    void buyGame_UnownedGame_ShouldAddGameAndSaveCustomer() {
        Game newGame = game2;
        when(customerRepository.save(customer)).thenReturn(customer);
        when(gameService.getGame(newGame.getId())).thenReturn(newGame);

        shopService.buyGame(newGame.getId());

        assertTrue(customer.getOwnedGames().contains(newGame));
        
        verify(customerRepository, times(1)).save(customer);
    }

    @Test
    void buyGame_AlreadyOwnedGame_ShouldThrowValidationException() {
        Game ownedGame = game1;
        when(gameService.getGame(ownedGame.getId())).thenReturn(ownedGame);

        assertThatThrownBy(() -> shopService.buyGame(ownedGame.getId()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Game already owned");

        verify(customerRepository, never()).save(any());
    }
}
