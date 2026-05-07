package com.unibuc.bundle_forge.controller;

import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.dto.DeveloperDto;
import com.unibuc.bundle_forge.dto.GameCreateDto;
import com.unibuc.bundle_forge.dto.GameResponseDto;
import com.unibuc.bundle_forge.dto.GameUpdateDto;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.service.DeveloperService;
import com.unibuc.bundle_forge.service.GameService;
import com.unibuc.bundle_forge.service.ProviderService;
import com.unibuc.bundle_forge.annotation.RequireProvider;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import com.unibuc.bundle_forge.utils.ViewUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("developers")
@RequiredArgsConstructor
public class DeveloperController extends ProviderController<Developer, DeveloperDto> {

    private final DeveloperService developerService;
    private final GameService gameService;

    @Override
    public ProviderService<Developer, DeveloperDto> getService() {
        return developerService;
    }

    @PostMapping(value = "/games", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @JsonView(ViewUtils.Provider.class)
    public ResponseEntity<GameResponseDto> announceGame(
            @RequestPart("game") @Valid GameCreateDto gameCreateDto,
            @RequestPart("cover") MultipartFile coverFile,
            @RequestPart("images") List<MultipartFile> imagesFiles
    ) {
        return ResponseUtils.created(gameService.announceGame(gameCreateDto, coverFile, imagesFiles));
    }

    @PutMapping("/games/{gameId}")
    @JsonView(ViewUtils.Provider.class)
    public ResponseEntity<GameResponseDto> updateGame(
            @PathVariable Integer gameId,
            @RequestBody @Valid GameUpdateDto gameUpdateDto
    ) {
        return ResponseUtils.created(gameService.updateGame(gameId, gameUpdateDto));
    }

    @GetMapping("/games")
    @JsonView(ViewUtils.Provider.class)
    @RequireProvider({Developer.class})
    public ResponseEntity<List<GameResponseDto>> getAllGames(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String title
    ) {
        return ResponseUtils.ok(gameService.getAllGamesOfCurrentProvider(status, title));
    }

    @DeleteMapping("/games/{gameId}")
    public ResponseEntity<Void> deleteGame(
            @PathVariable Integer gameId
    ) {
        gameService.deleteGame(gameId);
        return ResponseUtils.noContent();
    }

}
