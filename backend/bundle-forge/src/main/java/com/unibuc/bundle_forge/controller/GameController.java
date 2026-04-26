package com.unibuc.bundle_forge.controller;

import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.annotation.RequireProvider;
import com.unibuc.bundle_forge.dto.ContractDto;
import com.unibuc.bundle_forge.dto.GameCreateDto;
import com.unibuc.bundle_forge.dto.GameResponseDto;
import com.unibuc.bundle_forge.dto.GameUpdateDto;
import com.unibuc.bundle_forge.model.Contract;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.service.GameService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import com.unibuc.bundle_forge.utils.ValidationUtils;
import com.unibuc.bundle_forge.utils.ViewUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @GetMapping("")
    @RequireProvider({Developer.class, Publisher.class})
    public ResponseEntity<List<GameResponseDto>> getAllGames(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String title
    ) {
        return ResponseUtils.ok(gameService.getAllGamesOfCurrentProvider(status, title));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @JsonView(ViewUtils.Provider.class)
    @RequireProvider({Developer.class})
    public ResponseEntity<GameResponseDto> announceGame(
            @RequestPart("game") @Valid GameCreateDto gameCreateDto,
            @RequestPart("cover") MultipartFile coverFile,
            @RequestPart("images") List<MultipartFile> imagesFiles
    ) {
        return ResponseUtils.created(gameService.announceGame(gameCreateDto, coverFile, imagesFiles));
    }

    @PutMapping("/{gameId}")
    @JsonView(ViewUtils.Provider.class)
    @RequireProvider({Developer.class, Provider.class})
    public ResponseEntity<GameResponseDto> updateGame(
            @PathVariable Integer gameId,
            @RequestBody @Valid GameUpdateDto gameUpdateDto
    ) {
        return ResponseUtils.created(gameService.updateGame(gameId, gameUpdateDto));
    }

    @GetMapping({"/{gameId}/contracts"})
    @JsonView(ViewUtils.Provider.class)
    @RequireProvider({Developer.class})
    public ResponseEntity<List<Contract>> getContracts(
            @PathVariable Integer gameId
    ) {
        return ResponseUtils.ok(gameService.getGameContracts(gameId));
    }

    @PutMapping({"/{gameId}/contracts/{publisherId}"})
    @JsonView(ViewUtils.Provider.class)
    @RequireProvider({Developer.class})
    public ResponseEntity<Contract> acceptContract(
            @PathVariable Integer gameId,
            @PathVariable Integer publisherId,
            @RequestBody @Valid @Validated(ValidationUtils.Update.class) ContractDto contractDto
    ) {
        return ResponseUtils.ok(gameService.updateContractStatus(gameId, publisherId, contractDto));
    }

}
