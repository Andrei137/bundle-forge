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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LibraryServiceTest {

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private LibraryService libraryService;

    private Customer customer;
    private Game game1;
    private Game game2;

    @BeforeEach
    void setUp() {
        customer = TestUtils.newCustomer(1, "c@test.com");
        game1 = Game.builder().id(10).title("G1").price(10.0).build();
        game2 = Game.builder().id(11).title("G2").price(20.0).build();
        customer.setOwnedGames(List.of(game1, game2));
    }

    @Test
    void getOwnedGames_returnsCustomerGames() {
        when(jwtService.getCurrentCustomer()).thenReturn(customer);

        List<Game> result = libraryService.getOwnedGames();

        assertThat(result).containsExactly(game1, game2);
    }

    @Test
    void getOwnedGameById_found_returnsGame() {
        when(jwtService.getCurrentCustomer()).thenReturn(customer);

        Game result = libraryService.getOwnedGameById(11);

        assertThat(result).isSameAs(game2);
    }

    @Test
    void getOwnedGameById_missing_throws() {
        when(jwtService.getCurrentCustomer()).thenReturn(customer);

        assertThatThrownBy(() -> libraryService.getOwnedGameById(999))
                .isInstanceOf(NotFoundException.class);
    }
}
