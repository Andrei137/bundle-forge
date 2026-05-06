package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.dto.CredentialsDto;
import com.unibuc.bundle_forge.dto.CustomerDto;
import com.unibuc.bundle_forge.dto.DeveloperDto;
import com.unibuc.bundle_forge.dto.DisplayNameCheckDto;
import com.unibuc.bundle_forge.dto.EmailCheckDto;
import com.unibuc.bundle_forge.dto.PublisherDto;
import com.unibuc.bundle_forge.dto.TokenDto;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.model.User;
import com.unibuc.bundle_forge.service.AuthService;
import com.unibuc.bundle_forge.service.JwtService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import com.unibuc.bundle_forge.utils.ValidationUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    @PostMapping("/signin")
    public ResponseEntity<Map<String, Object>> signin(@RequestBody @Valid CredentialsDto credentials) {
        return ResponseUtils.ok(authService.signin(credentials));
    }

    @PostMapping("/signup")
    public ResponseEntity<Customer> signupCustomer(
            @RequestBody @Valid @Validated(ValidationUtils.Create.class) CustomerDto customerDto
    ) {
        return ResponseUtils.created(authService.signupCustomer(customerDto));
    }

    @PostMapping("/request/developer")
    public ResponseEntity<Developer> requestDeveloper(
            @RequestBody @Valid @Validated(ValidationUtils.Create.class) DeveloperDto developerDto
    ) {
        return ResponseUtils.created(authService.registerDeveloper(developerDto));
    }

    @PostMapping("/request/publisher")
    public ResponseEntity<Publisher> requestPublisher(
            @RequestBody @Valid @Validated(ValidationUtils.Create.class) PublisherDto publisherDto
    ) {
        return ResponseUtils.created(authService.registerPublisher(publisherDto));
    }

    @PostMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestBody EmailCheckDto emailCheckDto) {
        return ResponseUtils.ok(authService.checkEmail(emailCheckDto.getEmail()));
    }

    @PostMapping("/check-displayname")
    public ResponseEntity<Map<String, Boolean>> checkDisplayName(@RequestBody DisplayNameCheckDto displayNameCheckDto) {
        return ResponseUtils.ok(authService.checkDisplayName(displayNameCheckDto.getDisplayName()));
    }

}