package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.annotation.RequireProvider;
import com.unibuc.bundle_forge.dto.ContractDto;
import com.unibuc.bundle_forge.model.Contract;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.service.ContractService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @GetMapping("")
    @RequireProvider({Developer.class, Publisher.class})
    public ResponseEntity<List<Contract>> getAllContracts() {
        return ResponseUtils.ok(contractService.getAllContracts());
    }

    @PostMapping("/{gameId}")
    @RequireProvider({Publisher.class})
    public ResponseEntity<Contract> issueContract(
            @RequestBody @Valid ContractDto contractDto,
            @PathVariable Integer gameId
    ) {
        return ResponseUtils.created(contractService.issueContract(contractDto, gameId));
    }

    @PutMapping("/{gameId}")
    @RequireProvider({Publisher.class})
    public ResponseEntity<Contract> updateContract(
            @RequestBody @Valid ContractDto contractDto,
            @PathVariable Integer gameId
    ) {
        return ResponseUtils.ok(contractService.updateContract(contractDto, gameId));
    }

    @DeleteMapping("/{gameId}")
    @RequireProvider({Publisher.class})
    public ResponseEntity<Void> deleteContract(
            @PathVariable Integer gameId
    ) {
        contractService.deleteContract(gameId);
        return ResponseUtils.noContent();
    }

}
