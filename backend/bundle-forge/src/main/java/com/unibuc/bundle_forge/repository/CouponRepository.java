package com.unibuc.bundle_forge.repository;

import com.unibuc.bundle_forge.model.Coupon;
import com.unibuc.bundle_forge.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, String> {
    List<Coupon> findByCustomer(Customer customer);
}
