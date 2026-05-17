package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.CouponResponseDto;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.model.Coupon;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.repository.CouponRepository;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private CouponService couponService;

    private Coupon activeCoupon() {
        return Coupon.builder()
                .code("BF-AAA")
                .name("5% off")
                .type(Coupon.Type.PERCENTAGE)
                .value(BigDecimal.valueOf(5))
                .status(Coupon.Status.ACTIVE)
                .expirationDate(LocalDate.now().plusDays(10))
                .build();
    }

    @Test
    void validate_notFound_throws() {
        when(couponRepository.findById("missing")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> couponService.validate("missing"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void validate_active_returnsDto() {
        Coupon c = activeCoupon();
        when(couponRepository.findById(c.getCode())).thenReturn(Optional.of(c));

        CouponResponseDto dto = couponService.validate(c.getCode());

        assertThat(dto.getCode()).isEqualTo(c.getCode());
        assertThat(dto.getStatus()).isEqualTo("ACTIVE");
        assertThat(dto.getType()).isEqualTo("PERCENTAGE");
    }

    @Test
    void validate_expiredCoupon_expiresAndThrows() {
        Coupon c = activeCoupon();
        c.setExpirationDate(LocalDate.now().minusDays(1));
        when(couponRepository.findById(c.getCode())).thenReturn(Optional.of(c));

        assertThatThrownBy(() -> couponService.validate(c.getCode()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("expired");

        ArgumentCaptor<Coupon> captor = ArgumentCaptor.forClass(Coupon.class);
        verify(couponRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(Coupon.Status.EXPIRED);
    }

    @Test
    void validate_alreadyUsed_throws() {
        Coupon c = activeCoupon();
        c.setStatus(Coupon.Status.USED);
        when(couponRepository.findById(c.getCode())).thenReturn(Optional.of(c));

        assertThatThrownBy(() -> couponService.validate(c.getCode()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already been used");
    }

    @Test
    void markUsed_marksAndSaves() {
        Coupon c = activeCoupon();
        when(couponRepository.findById(c.getCode())).thenReturn(Optional.of(c));

        couponService.markUsed(c.getCode());

        assertThat(c.getStatus()).isEqualTo(Coupon.Status.USED);
        verify(couponRepository).save(c);
    }

    @Test
    void markUsed_missing_isNoop() {
        when(couponRepository.findById("nope")).thenReturn(Optional.empty());
        couponService.markUsed("nope");
        verify(couponRepository, never()).save(any());
    }

    @Test
    void generatePostPurchaseCoupon_savesWithCustomer() {
        Customer customer = TestUtils.newCustomer(1, "c@test.com");
        when(couponRepository.save(any(Coupon.class))).thenAnswer(inv -> inv.getArgument(0));

        couponService.generatePostPurchaseCoupon(customer);

        ArgumentCaptor<Coupon> captor = ArgumentCaptor.forClass(Coupon.class);
        verify(couponRepository).save(captor.capture());
        Coupon saved = captor.getValue();
        assertThat(saved.getCustomer()).isSameAs(customer);
        assertThat(saved.getType()).isEqualTo(Coupon.Type.PERCENTAGE);
        assertThat(saved.getValue()).isEqualByComparingTo(BigDecimal.valueOf(5));
        assertThat(saved.getStatus()).isEqualTo(Coupon.Status.ACTIVE);
        assertThat(saved.getCode()).startsWith("BF-");
        assertThat(saved.getExpirationDate()).isAfter(LocalDate.now().plusMonths(2));
    }

    @Test
    void getMyCoupons_mapsToDtos() {
        Customer customer = TestUtils.newCustomer(1, "c@test.com");
        Coupon c = activeCoupon();
        when(couponRepository.findByCustomer(customer)).thenReturn(List.of(c));

        List<CouponResponseDto> result = couponService.getMyCoupons(customer);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCode()).isEqualTo(c.getCode());
    }
}
