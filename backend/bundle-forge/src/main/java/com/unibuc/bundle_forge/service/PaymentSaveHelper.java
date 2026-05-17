package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.model.Payment;
import com.unibuc.bundle_forge.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
@RequiredArgsConstructor
class PaymentSaveHelper {

    private final PaymentRepository paymentRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Payment save(Payment payment) {
        return paymentRepository.save(payment);
    }

    // READ_COMMITTED so the outer REPEATABLE_READ snapshot doesn't hide
    // a payment that was just inserted by a concurrent winning request.
    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
    public Optional<Payment> findByUuid(String uuid) {
        return paymentRepository.findByUuid(uuid);
    }
}
