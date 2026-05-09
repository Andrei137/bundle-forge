package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.annotation.RequireAdmin;
import com.unibuc.bundle_forge.dto.CharityFounderCreateDto;
import com.unibuc.bundle_forge.dto.CharityFounderDto;
import com.unibuc.bundle_forge.service.CharityFounderService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/charity-founders")
@RequiredArgsConstructor
public class CharityFounderController {

    private final CharityFounderService charityFounderService;

    @GetMapping
    public ResponseEntity<List<CharityFounderDto>> getAll() {
        return ResponseUtils.ok(charityFounderService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CharityFounderDto> getById(@PathVariable Integer id) {
        return ResponseUtils.ok(charityFounderService.getById(id));
    }

    @PostMapping
    @RequireAdmin
    public ResponseEntity<CharityFounderDto> create(@RequestBody @Valid CharityFounderCreateDto dto) {
        return ResponseUtils.created(charityFounderService.create(dto));
    }

    @PutMapping("/{id}")
    @RequireAdmin
    public ResponseEntity<CharityFounderDto> update(
            @PathVariable Integer id,
            @RequestBody @Valid CharityFounderCreateDto dto
    ) {
        return ResponseUtils.ok(charityFounderService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @RequireAdmin
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return charityFounderService.delete(id);
    }
}
