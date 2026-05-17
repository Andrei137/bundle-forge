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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShopServiceTest {

    @Mock private CustomerRepository customerRepository;
    @Mock private GameRepository gameRepository;
    @Mock private GameService gameService;
    @Mock private JwtService jwtService;
    @Mock private GameMapper gameMapper;

    @InjectMocks
    private ShopService shopService;

    private Customer customer;
    private Game unownedPublished;
    private Game announced;

    @BeforeEach
    void setUp() {
        customer = TestUtils.newCustomer(1, "c@test.com");
        unownedPublished = Game.builder().id(2).title("Free").price(20.0).status(Game.Status.PUBLISHED).salesCount(0).build();
        announced = Game.builder().id(3).title("Soon").price(30.0).status(Game.Status.ANNOUNCED).salesCount(0).build();
        // Note: Game equality is configured with onlyExplicitlyIncluded=true with no included fields,
        // so all Games compare equal. Tests use an empty owned list to avoid that quirk in contains() checks.
        customer.setOwnedGames(new ArrayList<>());
    }

    @Test
    void getUnownedGames_filtersUnpublished() {
        when(jwtService.getCurrentCustomer()).thenReturn(customer);
        when(gameRepository.findAll()).thenReturn(List.of(unownedPublished, announced));
        when(gameMapper.toResponseDto(unownedPublished))
                .thenReturn(GameResponseDto.builder().id(2).title("Free").build());

        List<GameResponseDto> result = shopService.getUnownedGames();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(2);
    }

    @Test
    void getUnownedGameById_found() {
        when(jwtService.getCurrentCustomer()).thenReturn(customer);
        when(gameRepository.findAll()).thenReturn(List.of(unownedPublished));
        when(gameMapper.toResponseDto(unownedPublished))
                .thenReturn(GameResponseDto.builder().id(2).title("Free").build());

        GameResponseDto result = shopService.getUnownedGameById(2);
        assertThat(result.getId()).isEqualTo(2);
    }

    @Test
    void getUnownedGameById_missing_throws() {
        when(jwtService.getCurrentCustomer()).thenReturn(customer);
        when(gameRepository.findAll()).thenReturn(List.of());

        assertThatThrownBy(() -> shopService.getUnownedGameById(999))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void buyGame_addsToLibraryAndIncrementsSales() {
        when(gameService.getGame(2)).thenReturn(unownedPublished);
        when(jwtService.getCurrentCustomer()).thenReturn(customer);

        shopService.buyGame(2);

        assertThat(customer.getOwnedGames()).contains(unownedPublished);
        assertThat(unownedPublished.getSalesCount()).isEqualTo(1);
        verify(customerRepository).save(customer);
        verify(gameRepository).save(unownedPublished);
    }

    @Test
    void buyGame_alreadyOwned_throws() {
        customer.getOwnedGames().add(unownedPublished);
        when(gameService.getGame(2)).thenReturn(unownedPublished);
        when(jwtService.getCurrentCustomer()).thenReturn(customer);

        assertThatThrownBy(() -> shopService.buyGame(2))
                .isInstanceOf(ValidationException.class);
        verify(customerRepository, never()).save(any());
    }
}
