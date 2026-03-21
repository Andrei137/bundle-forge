package com.unibuc.bundle_forge.repository;

import com.unibuc.bundle_forge.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> { }
