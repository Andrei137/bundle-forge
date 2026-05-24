package com.unibuc.bundle_forge.controller;

import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.annotation.RequireAdmin;
import com.unibuc.bundle_forge.dto.ProviderResponseDto;
import com.unibuc.bundle_forge.dto.ProviderUpdateDto;
import com.unibuc.bundle_forge.service.AdminService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import com.unibuc.bundle_forge.utils.ViewUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/providers")
    @JsonView(ViewUtils.Admin.class)
    @RequireAdmin
    public ResponseEntity<List<ProviderResponseDto>> getProviders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String name
    ) {
        return ResponseUtils.ok(adminService.getProviders(status, name));
    }

    @PutMapping("/providers/{providerId}")
    @JsonView(ViewUtils.Admin.class)
    @RequireAdmin
    public ResponseEntity<ProviderResponseDto> changeStatusProvider(
            @PathVariable Integer providerId,
            @RequestBody @Valid ProviderUpdateDto providerUpdateDto
    ) {
        return ResponseUtils.ok(adminService.changeProviderStatus(providerId, providerUpdateDto.getStatus()));
    }

}
