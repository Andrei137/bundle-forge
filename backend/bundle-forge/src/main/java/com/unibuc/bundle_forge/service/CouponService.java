package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.CouponResponseDto;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.model.Coupon;
import com.unibuc.bundle_forge.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional
    public CouponResponseDto validate(String code) {
        Coupon coupon = couponRepository.findById(code)
                .orElseThrow(() -> new NotFoundException("Coupon not found"));

        if (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(LocalDate.now())) {
            if (coupon.getStatus() == Coupon.Status.ACTIVE) {
                coupon.setStatus(Coupon.Status.EXPIRED);
                couponRepository.save(coupon);
            }
            throw new ValidationException("Coupon has expired");
        }

        if (coupon.getStatus() != Coupon.Status.ACTIVE) {
            String reason = coupon.getStatus() == Coupon.Status.USED ? "already been used" : "expired";
            throw new ValidationException("Coupon has " + reason);
        }

        return toDto(coupon);
    }

    @Transactional
    public void markUsed(String code) {
        couponRepository.findById(code).ifPresent(c -> {
            c.setStatus(Coupon.Status.USED);
            couponRepository.save(c);
        });
    }

    public CouponResponseDto toDto(Coupon coupon) {
        return CouponResponseDto.builder()
                .code(coupon.getCode())
                .name(coupon.getName())
                .type(coupon.getType().name())
                .value(coupon.getValue())
                .build();
    }
}
