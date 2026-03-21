package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LibraryServiceTest {

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private LibraryService libraryService;

    private Game game1, game2;
    private Customer customer;

    @BeforeEach
    void setUp() {
        game1 = TestUtils.game1;
        game2 = TestUtils.game2;
        customer = TestUtils.customer1.toBuilder()
                .ownedGames(List.of(game1, game2))
                .build();

        when(jwtService.getCurrentCustomer()).thenReturn(customer);
    }

    @Test
    void getOwnedGames_ShouldReturnAllOwnedGames() {
        List<Game> ownedGames = libraryService.getOwnedGames();

        assertNotNull(ownedGames);
        assertEquals(customer.getOwnedGames().size(), ownedGames.size());
        for (int i = 0; i < ownedGames.size(); i++) {
            assertTrue(customer.getOwnedGames().contains(ownedGames.get(i)));
        }

        verify(jwtService, times(1)).getCurrentCustomer();
    }

    @Test
    void getOwnedGameById_ExistingGame_ShouldReturnGame() {
        Game game = libraryService.getOwnedGameById(game1.getId());

        assertNotNull(game);
        assertEquals(game1, game);

        verify(jwtService, times(1)).getCurrentCustomer();
    }

    @Test
    void getOwnedGameById_NonOwnedGame_ShouldThrowNotFoundException() {
        int nonOwnedId = 999;

        assertThatThrownBy(() -> libraryService.getOwnedGameById(nonOwnedId))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Game at id 999 not owned or doesn't exist");

        verify(jwtService, times(1)).getCurrentCustomer();
    }

}
