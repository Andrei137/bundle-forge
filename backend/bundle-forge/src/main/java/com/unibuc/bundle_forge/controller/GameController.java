package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.dto.GameResponseDto;
import com.unibuc.bundle_forge.service.GameService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @GetMapping("/{gameId}")
    public ResponseEntity<GameResponseDto> getGame(@PathVariable Integer gameId) {
        return ResponseUtils.ok(gameService.getGameDetails(gameId));
    }

}
