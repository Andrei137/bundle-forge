package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.CustomerDto;
import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.mapper.CustomerMapper;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.repository.CustomerRepository;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock private CustomerRepository customerRepository;
    @Mock private CustomerMapper customerMapper;
    @Mock private JwtService jwtService;

    @InjectMocks
    private CustomerService customerService;

    private Customer customer;

    @BeforeEach
    void setUp() {
        customer = TestUtils.newCustomer(1, "c@test.com");
        ReflectionTestUtils.setField(customerService, "jwtService", jwtService);
        ReflectionTestUtils.setField(customerService, "customerRepository", customerRepository);
        ReflectionTestUtils.setField(customerService, "customerMapper", customerMapper);
    }

    @Test
    void getAllUsers_delegatesToRepo() {
        when(customerRepository.findAll()).thenReturn(List.of(customer));
        List<Customer> result = customerService.getAllUsers();
        assertThat(result).containsExactly(customer);
    }

    @Test
    void getUserById_found() {
        when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
        assertThat(customerService.getUserById(1)).isSameAs(customer);
    }

    @Test
    void getUserById_missing_throws() {
        when(customerRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> customerService.getUserById(99))
                .hasMessageContaining("customer");
    }

    @Test
    void getCurrentUser_delegatesToJwt() {
        when(jwtService.getCurrentUser()).thenReturn(customer);
        assertThat(customerService.getCurrentUser()).isSameAs(customer);
    }

    @Test
    void updateLoggedUser_phoneTakenByOther_throws() {
        Customer other = TestUtils.newCustomer(2, "other@test.com");
        CustomerDto dto = new CustomerDto();
        dto.setPhoneNumber("0700000000");

        when(jwtService.getCurrentUser()).thenReturn(customer);
        when(customerRepository.findByPhoneNumber("0700000000")).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> customerService.updateLoggedUser(dto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already registered");
    }

    @Test
    void updateLoggedUser_phoneOwnedBySelf_saves() {
        CustomerDto dto = new CustomerDto();
        dto.setPhoneNumber(customer.getPhoneNumber());

        when(jwtService.getCurrentUser()).thenReturn(customer);
        when(customerRepository.findByPhoneNumber(customer.getPhoneNumber())).thenReturn(Optional.of(customer));
        when(customerRepository.save(customer)).thenReturn(customer);

        Customer result = customerService.updateLoggedUser(dto);

        assertThat(result).isSameAs(customer);
        verify(customerMapper).updateEntityFromDto(dto, customer);
    }

    @Test
    void updateLoggedUser_passwordChangeWithoutCurrent_throws() {
        CustomerDto dto = new CustomerDto();
        dto.setPassword("NewPass1!");

        when(jwtService.getCurrentUser()).thenReturn(customer);

        assertThatThrownBy(() -> customerService.updateLoggedUser(dto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Current password is required");
    }

    @Test
    void updateLoggedUser_wrongCurrentPassword_throws() {
        CustomerDto dto = new CustomerDto();
        dto.setPassword("NewPass1!");
        dto.setCurrentPassword("not-the-real-one");

        when(jwtService.getCurrentUser()).thenReturn(customer);

        assertThatThrownBy(() -> customerService.updateLoggedUser(dto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Current password is incorrect");
    }

    @Test
    void updateLoggedUser_sameOldAndNewPassword_throws() {
        CustomerDto dto = new CustomerDto();
        dto.setPassword(TestUtils.RAW_PASSWORD);
        dto.setCurrentPassword(TestUtils.RAW_PASSWORD);

        when(jwtService.getCurrentUser()).thenReturn(customer);

        assertThatThrownBy(() -> customerService.updateLoggedUser(dto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("must be different");
    }

    @Test
    void updateLoggedUser_validPasswordChange_savesEncryptedPassword() {
        CustomerDto dto = new CustomerDto();
        dto.setPassword("BrandNew_42");
        dto.setCurrentPassword(TestUtils.RAW_PASSWORD);

        when(jwtService.getCurrentUser()).thenReturn(customer);
        when(customerRepository.save(customer)).thenReturn(customer);

        Customer result = customerService.updateLoggedUser(dto);

        assertThat(result).isSameAs(customer);
        // password in dto should be replaced with an encrypted version
        assertThat(dto.getPassword()).isNotEqualTo("BrandNew_42");
        verify(customerMapper).updateEntityFromDto(dto, customer);
    }
}
