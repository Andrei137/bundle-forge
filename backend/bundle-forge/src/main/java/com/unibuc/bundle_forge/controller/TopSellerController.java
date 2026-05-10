package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.dto.FeaturedItemDto;
import com.unibuc.bundle_forge.service.TopSellerService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/top-sellers")
@RequiredArgsConstructor
public class TopSellerController {

    private final TopSellerService topSellerService;

    @GetMapping
    public ResponseEntity<List<FeaturedItemDto>> getTopSellers(
            @RequestParam(required = false, defaultValue = "ALL") String filter
    ) {
        return ResponseUtils.ok(topSellerService.getTopSellers(filter));
    }
}
