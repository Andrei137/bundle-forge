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
import com.unibuc.bundle_forge.repository.CustomerRepository;
import com.unibuc.bundle_forge.repository.DeveloperRepository;
import com.unibuc.bundle_forge.repository.PublisherRepository;
import com.unibuc.bundle_forge.repository.UserRepository;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private PublisherRepository publisherRepository;

    @Mock
    private DeveloperRepository developerRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private CustomerMapper customerMapper;

    @Mock
    private PublisherMapper publisherMapper;

    @Mock
    private DeveloperMapper developerMapper;

    @InjectMocks
    private AuthService authService;

    private Customer customer;
    private Developer developer;
    private Publisher publisher;

    @BeforeEach
    void setUp() {
        customer = TestUtils.customer1;
        developer = TestUtils.developer1;
        publisher = TestUtils.publisher1;
    }
    
    @Test
    void signin_ValidCustomer_ShouldReturnToken() {
        CredentialsDto credentials = new CredentialsDto(customer.getUsername(), TestUtils.password);

        when(userRepository.findByUsername(credentials.getUsername())).thenReturn(customer);
        when(jwtService.getToken(String.valueOf(customer.getId()))).thenReturn("token-valid");

        TokenDto token = authService.signin(credentials);

        assertNotNull(token);
        assertEquals("token-valid", token.getToken());
        verify(userRepository, times(1)).findByUsername(credentials.getUsername());
        verify(jwtService, times(1)).getToken(String.valueOf(customer.getId()));
    }

    @Test
    void signin_InvalidUsername_ShouldThrowValidationException() {
        CredentialsDto credentials = new CredentialsDto("username", TestUtils.password);

        when(userRepository.findByUsername(credentials.getUsername())).thenReturn(null);

        assertThatThrownBy(() -> authService.signin(credentials))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Invalid username or password");
    }

    @Test
    void signin_InvalidPassword_ShouldThrowValidationException() {
        CredentialsDto credentials = new CredentialsDto(customer.getUsername(), "bad-password");

        when(userRepository.findByUsername(credentials.getUsername())).thenReturn(customer);

        assertThatThrownBy(() -> authService.signin(credentials))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Invalid username or password");
    }

    @Test
    void signin_ProviderBanned_ShouldThrowForbiddenException() {
        Developer dev = developer.toBuilder().status(Provider.Status.BANNED).build();
        CredentialsDto credentials = new CredentialsDto(dev.getUsername(), TestUtils.password);

        when(userRepository.findByUsername(credentials.getUsername())).thenReturn(dev);

        assertThatThrownBy(() -> authService.signin(credentials))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Banned account");
    }

    @Test
    void signin_ProviderPending_ShouldThrowForbiddenException() {
        Developer dev = developer.toBuilder().status(Provider.Status.PENDING).build();
        CredentialsDto credentials = new CredentialsDto(dev.getUsername(), TestUtils.password);

        when(userRepository.findByUsername(credentials.getUsername())).thenReturn(dev);

        assertThatThrownBy(() -> authService.signin(credentials))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Account awaiting approval");
    }

    @Test
    void signin_ProviderAccepted_ShouldReturnToken() {
        Developer dev = developer.toBuilder().status(Provider.Status.ACCEPTED).build();
        CredentialsDto credentials = new CredentialsDto(dev.getUsername(), TestUtils.password);

        when(userRepository.findByUsername(credentials.getUsername())).thenReturn(dev);
        when(jwtService.getToken(String.valueOf(dev.getId()))).thenReturn("token-dev");

        TokenDto token = authService.signin(credentials);

        assertNotNull(token);
        assertEquals("token-dev", token.getToken());
    }

    @Test
    void signupCustomer_ShouldSave() {
        CustomerDto dto = new CustomerDto();

        when(customerMapper.toEntity(dto)).thenReturn(customer);
        when(customerRepository.save(customer)).thenReturn(customer);

        Customer result = authService.signupCustomer(dto);

        assertNotNull(result);
        assertEquals(customer, result);
        verify(customerMapper, times(1)).toEntity(dto);
        verify(customerRepository, times(1)).save(customer);
    }

    @Test
    void registerPublisher_ShouldSave() {
        PublisherDto dto = new PublisherDto();

        when(publisherMapper.toEntity(dto)).thenReturn(publisher);
        when(publisherRepository.save(publisher)).thenReturn(publisher);

        Publisher result = authService.registerPublisher(dto);

        assertNotNull(result);
        assertEquals(publisher, result);
        verify(publisherMapper, times(1)).toEntity(dto);
        verify(publisherRepository, times(1)).save(publisher);
    }

    @Test
    void registerDeveloper_ShouldSave() {
        DeveloperDto dto = new DeveloperDto();

        when(developerMapper.toEntity(dto)).thenReturn(developer);
        when(developerRepository.save(developer)).thenReturn(developer);

        Developer result = authService.registerDeveloper(dto);

        assertNotNull(result);
        assertEquals(developer, result);
        verify(developerMapper, times(1)).toEntity(dto);
        verify(developerRepository, times(1)).save(developer);
    }
}
