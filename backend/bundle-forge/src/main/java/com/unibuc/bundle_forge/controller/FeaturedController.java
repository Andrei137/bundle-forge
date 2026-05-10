package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.dto.FeaturedSlideDto;
import com.unibuc.bundle_forge.service.FeaturedService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/featured")
@RequiredArgsConstructor
public class FeaturedController {

    private final FeaturedService featuredService;

    @GetMapping
    public ResponseEntity<List<FeaturedSlideDto>> getFeatured() {
        return ResponseUtils.ok(featuredService.getFeatured());
    }
}
