package com.unibuc.bundle_forge.repository;

import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByUuid(String uuid);
    List<Payment> findAllByCustomerOrderByCreatedAtDesc(Customer customer);
}
