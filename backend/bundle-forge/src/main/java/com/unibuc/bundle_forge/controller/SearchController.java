package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.dto.SearchPageDto;
import com.unibuc.bundle_forge.service.SearchService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<SearchPageDto> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) List<Integer> tagIds,
            @RequestParam(required = false) String developer,
            @RequestParam(required = false) List<String> platforms,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(defaultValue = "newest") String sort
    ) {
        return ResponseUtils.ok(searchService.search(q, type, tagIds, developer, platforms, page, size, sort));
    }

}
