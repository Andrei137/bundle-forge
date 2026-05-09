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

    // TODO: change requestmapping for the rest
    @GetMapping("/{gameId}")
    public ResponseEntity<GameResponseDto> getGame(
            @PathVariable Integer gameId
    ) {
        return ResponseUtils.ok(gameService.getGameDetails(gameId));
    }

    // TODO: remove
    @GetMapping({"/{gameId}/contracts"})
    @JsonView(ViewUtils.Provider.class)
    @RequireProvider({Developer.class})
    public ResponseEntity<List<Contract>> getContracts(
            @PathVariable Integer gameId
    ) {
        return ResponseUtils.ok(gameService.getGameContracts(gameId));
    }

    // TODO: remove
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
