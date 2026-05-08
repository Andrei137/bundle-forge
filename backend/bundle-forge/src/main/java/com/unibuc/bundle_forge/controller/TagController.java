package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.model.Tag;
import com.unibuc.bundle_forge.service.TagService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping("")
    public ResponseEntity<List<Tag>> getAllTags() {
        return ResponseUtils.ok(tagService.getAllTags());
    }

    @PostMapping("")
    public ResponseEntity<Tag> createTag(@RequestBody Map<String, String> request) {
        return ResponseUtils.created(tagService.createTag(request.get("name")));
    }
}
