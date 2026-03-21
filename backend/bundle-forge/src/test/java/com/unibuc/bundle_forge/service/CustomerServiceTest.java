package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.CustomerDto;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.mapper.CustomerMapper;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.repository.CustomerRepository;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerMapper customerMapper;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private CustomerService customerService;

    private Customer customer;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        customer = TestUtils.customer1;
    }

    @Test
    void getAllUsers_ShouldReturnAllCustomers() {
        when(customerRepository.findAll()).thenReturn(TestUtils.customers);

        List<Customer> result = customerService.getAllUsers();

        assertNotNull(result);
        assertEquals(TestUtils.customers.size(), result.size());
        verify(customerRepository, times(1)).findAll();
    }

    @Test
    void getUserById_WhenCustomerExists_ShouldReturnCustomer() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));

        Customer result = customerService.getUserById(customer.getId());

        assertNotNull(result);
        assertEquals(customer, result);
        verify(customerRepository, times(1)).findById(customer.getId());
    }

    @Test
    void getUserById_WhenCustomerDoesNotExist_ShouldThrowNotFoundException() {
        when(customerRepository.findById(404)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.getUserById(404))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("No customer found at id 404");

        verify(customerRepository, times(1)).findById(404);
    }

    @Test
    void getCurrentUser_ShouldReturnCurrentCustomer() {
        when(jwtService.getCurrentUser()).thenReturn(customer);

        Customer result = customerService.getCurrentUser();

        assertNotNull(result);
        assertEquals(customer, result);
        verify(jwtService, times(1)).getCurrentUser();
    }

    @Test
    void updateLoggedUser_ShouldUpdateAndReturnCustomer() {
        CustomerDto customerDto = new CustomerDto();
        when(jwtService.getCurrentUser()).thenReturn(customer);
        doNothing().when(customerMapper).updateEntityFromDto(customerDto, customer);
        when(customerRepository.save(customer)).thenReturn(customer);

        Customer result = customerService.updateLoggedUser(customerDto);

        assertNotNull(result);
        assertEquals(customer, result);

        verify(jwtService, times(1)).getCurrentUser();
        verify(customerMapper, times(1)).updateEntityFromDto(customerDto, customer);
        verify(customerRepository, times(1)).save(customer);
    }
}
