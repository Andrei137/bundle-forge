package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.CustomerDto;
import com.unibuc.bundle_forge.mapper.CustomerMapper;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public final class CustomerService extends UserService<Customer, CustomerDto> {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerMapper customerMapper;

    @Autowired
    private JwtService jwtService;

    @Override
    protected JpaRepository<Customer, Integer> getRepository() {
        return customerRepository;
    }

    @Override
    protected String getEntityName() {
        return "customer";
    }

    @Override
    protected CustomerMapper getMapper() {
        return customerMapper;
    }
}
