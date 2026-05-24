package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.CredentialsDto;
import com.unibuc.bundle_forge.dto.CustomerDto;
import com.unibuc.bundle_forge.dto.DeveloperDto;
import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.mapper.CustomerMapper;
import com.unibuc.bundle_forge.mapper.DeveloperMapper;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.model.User;
import com.unibuc.bundle_forge.repository.CustomerRepository;
import com.unibuc.bundle_forge.repository.DeveloperRepository;
import com.unibuc.bundle_forge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public final class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final DeveloperRepository developerRepository;
    private final JwtService jwtService;
    private final CustomerMapper customerMapper;
    private final DeveloperMapper developerMapper;

    public Map<String, Object> signin(CredentialsDto credentials) {
        log.debug("Signin attempt for email={}", credentials.getEmail());
        User user = userRepository.findByEmail(credentials.getEmail());

        if (user == null || !JwtService.isPasswordValid(credentials.getPassword(), user.getPassword())) {
            log.info("Failed signin attempt for email={}", credentials.getEmail());
            throw new ValidationException("Invalid email or password");
        }
        log.info("User id={} signed in", user.getId());

        Map<String, Object> response = new HashMap<>();
        String token = jwtService.getToken(String.valueOf(user.getId()), credentials.isRememberMe());
        response.put("token", token);

        if (user instanceof Customer) {
            response.put("userType", "CUSTOMER");
            response.put("blocked", false);
        } else if (user instanceof Developer developer) {
            response.put("userType", "DEVELOPER");
            response.put("status", developer.getStatus().toString());
            String message = switch (developer.getStatus()) {
                case BANNED -> "Banned account";
                case PENDING -> "Account awaiting approval";
                case REJECTED -> "Account rejected";
                default -> null;
            };
            if (message != null) {
                response.put("statusMessage", message);
                response.put("blocked", true);
            } else {
                response.put("blocked", false);
            }
        }

        return response;
    }

    public Customer signupCustomer(CustomerDto customer) {
        if (customerRepository.findByPhoneNumber(customer.getPhoneNumber()).isPresent()) {
            throw new ValidationException("This phone number is already registered");
        }
        Customer saved = customerRepository.save(customerMapper.toEntity(customer));
        log.info("Customer registered id={} email={}", saved.getId(), saved.getEmail());
        return saved;
    }

    public Developer registerDeveloper(DeveloperDto developer) {
        if (developerRepository.findByDisplayName(developer.getDisplayName()).isPresent()) {
            throw new ValidationException("This display name is already registered");
        }
        return developerRepository.save(developerMapper.toEntity(developer));
    }

    public Map<String, Boolean> checkEmail(String email) {
        boolean exists = userRepository.findByEmail(email) != null;
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return response;
    }

    public Map<String, Boolean> checkDisplayName(String displayName) {
        boolean exists = developerRepository.findByDisplayName(displayName).isPresent();
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return response;
    }

}
