package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.GameResponseDto;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.mapper.GameMapper;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.repository.CustomerRepository;
import com.unibuc.bundle_forge.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public final class ShopService {

    private final CustomerRepository customerRepository;
    private final GameRepository gameRepository;
    private final GameService gameService;
    private final JwtService jwtService;
    private final GameMapper gameMapper;

    public List<GameResponseDto> getUnownedGames() {
        Customer customer = jwtService.getCurrentCustomer();
        assert customer != null;
        return gameRepository
                .findAll()
                .stream()
                .filter(g -> g.getStatus().equals(Game.Status.PUBLISHED))
                .filter(g -> !customer.getOwnedGames().contains(g))
                .map(gameMapper::toResponseDto)
                .toList();
    }

    public GameResponseDto getUnownedGameById(Integer gameId) {
        return getUnownedGames()
                .stream()
                .filter(g -> g.getId().equals(gameId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException(String.format("Game at id %d owned or doesn't exist", gameId)));
    }

    public void buyGame(Integer gameId) {
        Game game = gameService.getGame(gameId);
        Customer customer = jwtService.getCurrentCustomer();

        if (customer.getOwnedGames().contains(game)) {
            throw new ValidationException("Game already owned");
        }

        customer.getOwnedGames().add(game);
        customerRepository.save(customer);
    }

}
