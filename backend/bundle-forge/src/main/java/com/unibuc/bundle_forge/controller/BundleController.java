package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.annotation.RequireAdmin;
import com.unibuc.bundle_forge.dto.BundleCreateDto;
import com.unibuc.bundle_forge.dto.BundleResponseDto;
import com.unibuc.bundle_forge.service.BundleService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/bundles")
@RequiredArgsConstructor
public class BundleController {

    private final BundleService bundleService;

    @GetMapping
    public ResponseEntity<List<BundleResponseDto>> getAllBundles() {
        return ResponseUtils.ok(bundleService.getAllBundles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BundleResponseDto> getBundle(@PathVariable Integer id) {
        return ResponseUtils.ok(bundleService.getBundle(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequireAdmin
    public ResponseEntity<BundleResponseDto> createBundle(
            @RequestPart("bundle") @Valid BundleCreateDto dto,
            @RequestPart("cover") MultipartFile coverFile
    ) {
        return ResponseUtils.created(bundleService.createBundle(dto, coverFile));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequireAdmin
    public ResponseEntity<BundleResponseDto> updateBundle(
            @PathVariable Integer id,
            @RequestPart("bundle") @Valid BundleCreateDto dto,
            @RequestPart(value = "cover", required = false) MultipartFile coverFile
    ) {
        return ResponseUtils.ok(bundleService.updateBundle(id, dto, coverFile));
    }

    @DeleteMapping("/{id}")
    @RequireAdmin
    public ResponseEntity<Void> deleteBundle(@PathVariable Integer id) {
        return bundleService.deleteBundle(id);
    }
}
