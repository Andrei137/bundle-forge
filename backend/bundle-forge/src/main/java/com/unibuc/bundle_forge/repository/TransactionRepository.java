package com.unibuc.bundle_forge.repository;

import com.unibuc.bundle_forge.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByGatewayTransactionId(String gatewayTransactionId);
}
