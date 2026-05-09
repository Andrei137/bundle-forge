package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.annotation.RequireProvider;
import com.unibuc.bundle_forge.dto.GameKeyUploadDto;
import com.unibuc.bundle_forge.dto.GameKeyUploadResponseDto;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.service.GameKeyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/games/{gameId}/keys")
@RequiredArgsConstructor
public class GameKeyController {

    private final GameKeyService gameKeyService;

    @PostMapping
    @RequireProvider({Developer.class})
    public ResponseEntity<GameKeyUploadResponseDto> uploadKeys(
            @PathVariable Integer gameId,
            @RequestBody GameKeyUploadDto dto
    ) {
        return ResponseEntity.ok(gameKeyService.uploadKeys(gameId, dto.getKeys()));
    }
}
