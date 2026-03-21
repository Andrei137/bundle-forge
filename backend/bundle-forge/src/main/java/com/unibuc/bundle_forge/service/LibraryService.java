package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.model.Game;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public final class LibraryService {

    private final JwtService jwtService;

    public List<Game> getOwnedGames() {
        return jwtService.getCurrentCustomer().getOwnedGames();
    }

    public Game getOwnedGameById(Integer gameId) {
        return getOwnedGames()
                .stream()
                .filter(game -> game.getId().equals(gameId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException(String.format("Game at id %d not owned or doesn't exist", gameId)));
    }

}
