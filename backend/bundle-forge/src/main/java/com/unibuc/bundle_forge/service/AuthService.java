package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.CredentialsDto;
import com.unibuc.bundle_forge.dto.CustomerDto;
import com.unibuc.bundle_forge.dto.DeveloperDto;
import com.unibuc.bundle_forge.dto.PublisherDto;
import com.unibuc.bundle_forge.dto.TokenDto;
import com.unibuc.bundle_forge.exception.ForbiddenException;
import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.mapper.CustomerMapper;
import com.unibuc.bundle_forge.mapper.DeveloperMapper;
import com.unibuc.bundle_forge.mapper.PublisherMapper;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.model.User;
import com.unibuc.bundle_forge.repository.CustomerRepository;
import com.unibuc.bundle_forge.repository.DeveloperRepository;
import com.unibuc.bundle_forge.repository.PublisherRepository;
import com.unibuc.bundle_forge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public final class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PublisherRepository publisherRepository;
    private final DeveloperRepository developerRepository;
    private final JwtService jwtService;
    private final CustomerMapper customerMapper;
    private final PublisherMapper publisherMapper;
    private final DeveloperMapper developerMapper;

    public TokenDto signin(CredentialsDto credentials) {
        User user = userRepository.findByUsername(credentials.getUsername());

        if (user == null || !JwtService.isPasswordValid(credentials.getPassword(), user.getPassword())) {
            throw new ValidationException("Invalid username or password");
        }
        if (user instanceof Provider provider) {
            String message = switch (provider.getStatus()) {
                case BANNED -> "Banned account";
                case PENDING -> "Account awaiting approval";
                case REJECTED -> "Account rejected";
                default -> null;
            };
            if (message != null) throw new ForbiddenException(message);
        }

        return new TokenDto(jwtService.getToken(String.valueOf(user.getId())));
    }

    public Customer signupCustomer(CustomerDto customer) {
        return customerRepository.save(customerMapper.toEntity(customer));
    }

    public Publisher registerPublisher(PublisherDto publisher) {
        return publisherRepository.save(publisherMapper.toEntity(publisher));
    }

    public Developer registerDeveloper(DeveloperDto developer) {
        return developerRepository.save(developerMapper.toEntity(developer));
    }

}