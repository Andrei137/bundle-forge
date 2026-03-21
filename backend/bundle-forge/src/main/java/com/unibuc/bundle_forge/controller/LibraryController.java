package com.unibuc.bundle_forge.controller;

import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.annotation.RequireCustomer;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.service.LibraryService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import com.unibuc.bundle_forge.utils.ViewUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/library")
@RequiredArgsConstructor
public class LibraryController {

    public final LibraryService libraryService;

    @GetMapping("")
    @RequireCustomer
    @JsonView(ViewUtils.Public.class)
    public ResponseEntity<List<Game>> getAllGames() {
        return ResponseUtils.ok(libraryService.getOwnedGames());
    }

    @GetMapping("/{gameId}")
    @RequireCustomer
    @JsonView(ViewUtils.Public.class)
    public ResponseEntity<Game> getGameById(
            @PathVariable Integer gameId
    ) {
        return ResponseUtils.ok(libraryService.getOwnedGameById(gameId));
    }

}
