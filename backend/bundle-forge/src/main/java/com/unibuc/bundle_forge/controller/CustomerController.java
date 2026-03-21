package com.unibuc.bundle_forge.controller;

import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.annotation.RequireCustomer;
import com.unibuc.bundle_forge.dto.CustomerDto;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.service.CustomerService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import com.unibuc.bundle_forge.utils.ValidationUtils.Update;
import com.unibuc.bundle_forge.utils.ViewUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("")
    @JsonView(ViewUtils.Public.class)
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseUtils.ok(customerService.getAllUsers());
    }

    @GetMapping("/me")
    @JsonView(ViewUtils.Public.class)
    @RequireCustomer
    public ResponseEntity<Customer> getCurrentCustomer() {
        return ResponseUtils.ok(customerService.getCurrentUser());
    }

    @GetMapping("/{customerId}")
    @JsonView(ViewUtils.Public.class)
    public ResponseEntity<Customer> getCustomer(@PathVariable Integer customerId) {
        return ResponseUtils.ok(customerService.getUserById(customerId));
    }

    @PutMapping("")
    @JsonView(ViewUtils.Public.class)
    @RequireCustomer
    public ResponseEntity<Customer> updateCustomer(@RequestBody @Validated(Update.class) CustomerDto customerDto) {
        return ResponseUtils.ok(customerService.updateLoggedUser(customerDto));
    }

}
