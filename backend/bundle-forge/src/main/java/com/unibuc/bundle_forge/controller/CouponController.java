package com.unibuc.bundle_forge.controller;

import com.unibuc.bundle_forge.annotation.RequireCustomer;
import com.unibuc.bundle_forge.dto.CouponResponseDto;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.service.CouponService;
import com.unibuc.bundle_forge.service.JwtService;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;
    private final JwtService jwtService;

    @GetMapping("/{code}")
    public ResponseEntity<CouponResponseDto> validate(@PathVariable String code) {
        return ResponseUtils.ok(couponService.validate(code));
    }

    @GetMapping("/my")
    @RequireCustomer
    public ResponseEntity<List<CouponResponseDto>> getMyCoupons() {
        Customer customer = jwtService.getCurrentCustomer();
        return ResponseUtils.ok(couponService.getMyCoupons(customer));
    }
}
