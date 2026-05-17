package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.CredentialsDto;
import com.unibuc.bundle_forge.dto.CustomerDto;
import com.unibuc.bundle_forge.dto.DeveloperDto;
import com.unibuc.bundle_forge.dto.PublisherDto;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private PublisherRepository publisherRepository;
    @Mock private DeveloperRepository developerRepository;
    @Mock private JwtService jwtService;
    @Mock private CustomerMapper customerMapper;
    @Mock private PublisherMapper publisherMapper;
    @Mock private DeveloperMapper developerMapper;

    @InjectMocks
    private AuthService authService;

    @Test
    void signin_validCustomer_returnsTokenAndType() {
        Customer customer = TestUtils.newCustomer(1, "cust@test.com");
        CredentialsDto creds = new CredentialsDto(customer.getEmail(), TestUtils.RAW_PASSWORD);

        when(userRepository.findByEmail(creds.getEmail())).thenReturn(customer);
        when(jwtService.getToken(String.valueOf(customer.getId()))).thenReturn("tok-1");

        Map<String, Object> response = authService.signin(creds);

        assertThat(response.get("token")).isEqualTo("tok-1");
        assertThat(response.get("userType")).isEqualTo("CUSTOMER");
        assertThat(response.get("blocked")).isEqualTo(false);
    }

    @Test
    void signin_unknownEmail_throws() {
        CredentialsDto creds = new CredentialsDto("missing@test.com", "any");
        when(userRepository.findByEmail("missing@test.com")).thenReturn(null);

        assertThatThrownBy(() -> authService.signin(creds))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void signin_wrongPassword_throws() {
        Customer customer = TestUtils.newCustomer(1, "cust@test.com");
        CredentialsDto creds = new CredentialsDto(customer.getEmail(), "wrong");
        when(userRepository.findByEmail(customer.getEmail())).thenReturn(customer);

        assertThatThrownBy(() -> authService.signin(creds))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void signin_developerAccepted_unblocked() {
        Developer dev = TestUtils.newDeveloper(2, "dev@test.com", Provider.Status.ACCEPTED);
        CredentialsDto creds = new CredentialsDto(dev.getEmail(), TestUtils.RAW_PASSWORD);
        when(userRepository.findByEmail(dev.getEmail())).thenReturn(dev);
        when(jwtService.getToken("2")).thenReturn("tok-dev");

        Map<String, Object> res = authService.signin(creds);

        assertThat(res.get("userType")).isEqualTo("DEVELOPER");
        assertThat(res.get("status")).isEqualTo("ACCEPTED");
        assertThat(res.get("blocked")).isEqualTo(false);
    }

    @Test
    void signin_developerBanned_blocked() {
        Developer dev = TestUtils.newDeveloper(2, "dev@test.com", Provider.Status.BANNED);
        CredentialsDto creds = new CredentialsDto(dev.getEmail(), TestUtils.RAW_PASSWORD);
        when(userRepository.findByEmail(dev.getEmail())).thenReturn(dev);
        when(jwtService.getToken(any())).thenReturn("tok-dev");

        Map<String, Object> res = authService.signin(creds);

        assertThat(res.get("blocked")).isEqualTo(true);
        assertThat(res.get("statusMessage")).isEqualTo("Banned account");
    }

    @Test
    void signin_developerPending_blocked() {
        Developer dev = TestUtils.newDeveloper(2, "dev@test.com", Provider.Status.PENDING);
        CredentialsDto creds = new CredentialsDto(dev.getEmail(), TestUtils.RAW_PASSWORD);
        when(userRepository.findByEmail(dev.getEmail())).thenReturn(dev);
        when(jwtService.getToken(any())).thenReturn("tok-dev");

        Map<String, Object> res = authService.signin(creds);

        assertThat(res.get("blocked")).isEqualTo(true);
        assertThat(res.get("statusMessage")).isEqualTo("Account awaiting approval");
    }

    @Test
    void signin_publisherRejected_blocked() {
        Publisher pub = TestUtils.newPublisher(3, "pub@test.com", Provider.Status.REJECTED);
        CredentialsDto creds = new CredentialsDto(pub.getEmail(), TestUtils.RAW_PASSWORD);
        when(userRepository.findByEmail(pub.getEmail())).thenReturn(pub);
        when(jwtService.getToken(any())).thenReturn("tok-pub");

        Map<String, Object> res = authService.signin(creds);

        assertThat(res.get("userType")).isEqualTo("PUBLISHER");
        assertThat(res.get("blocked")).isEqualTo(true);
        assertThat(res.get("statusMessage")).isEqualTo("Account rejected");
    }

    @Test
    void signupCustomer_savesWhenPhoneFree() {
        CustomerDto dto = new CustomerDto();
        dto.setPhoneNumber("0712345678");
        Customer entity = TestUtils.newCustomer(1, "c@test.com");

        when(customerRepository.findByPhoneNumber("0712345678")).thenReturn(Optional.empty());
        when(customerMapper.toEntity(dto)).thenReturn(entity);
        when(customerRepository.save(entity)).thenReturn(entity);

        Customer result = authService.signupCustomer(dto);

        assertThat(result).isSameAs(entity);
        verify(customerRepository).save(entity);
    }

    @Test
    void signupCustomer_phoneTaken_throws() {
        CustomerDto dto = new CustomerDto();
        dto.setPhoneNumber("0712345678");
        when(customerRepository.findByPhoneNumber("0712345678"))
                .thenReturn(Optional.of(TestUtils.newCustomer(9, "x@test.com")));

        assertThatThrownBy(() -> authService.signupCustomer(dto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("phone");
    }

    @Test
    void registerPublisher_uniqueDisplayName_saves() {
        PublisherDto dto = PublisherDto.builder().displayName("MyStudio").build();
        Publisher entity = TestUtils.newPublisher(5, "pub@test.com", Provider.Status.PENDING);

        when(publisherRepository.findByDisplayName("MyStudio")).thenReturn(Optional.empty());
        when(publisherMapper.toEntity(dto)).thenReturn(entity);
        when(publisherRepository.save(entity)).thenReturn(entity);

        assertThat(authService.registerPublisher(dto)).isSameAs(entity);
    }

    @Test
    void registerPublisher_displayNameTaken_throws() {
        PublisherDto dto = PublisherDto.builder().displayName("Taken").build();
        when(publisherRepository.findByDisplayName("Taken"))
                .thenReturn(Optional.of(TestUtils.newPublisher(1, "p@test.com", Provider.Status.ACCEPTED)));

        assertThatThrownBy(() -> authService.registerPublisher(dto))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void registerDeveloper_uniqueDisplayName_saves() {
        DeveloperDto dto = DeveloperDto.builder().displayName("DevHouse").build();
        Developer entity = TestUtils.newDeveloper(6, "dev@test.com", Provider.Status.PENDING);

        when(developerRepository.findByDisplayName("DevHouse")).thenReturn(Optional.empty());
        when(developerMapper.toEntity(dto)).thenReturn(entity);
        when(developerRepository.save(entity)).thenReturn(entity);

        assertThat(authService.registerDeveloper(dto)).isSameAs(entity);
    }

    @Test
    void registerDeveloper_displayNameTaken_throws() {
        DeveloperDto dto = DeveloperDto.builder().displayName("Taken").build();
        when(developerRepository.findByDisplayName("Taken"))
                .thenReturn(Optional.of(TestUtils.newDeveloper(1, "d@test.com", Provider.Status.ACCEPTED)));

        assertThatThrownBy(() -> authService.registerDeveloper(dto))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void checkEmail_exists() {
        when(userRepository.findByEmail("a@test.com")).thenReturn(TestUtils.newCustomer(1, "a@test.com"));
        Map<String, Boolean> result = authService.checkEmail("a@test.com");
        assertThat(result.get("exists")).isTrue();
    }

    @Test
    void checkEmail_missing() {
        when(userRepository.findByEmail("nope@test.com")).thenReturn(null);
        Map<String, Boolean> result = authService.checkEmail("nope@test.com");
        assertThat(result.get("exists")).isFalse();
    }

    @Test
    void checkDisplayName_takenByPublisher() {
        when(developerRepository.findByDisplayName("name")).thenReturn(Optional.empty());
        when(publisherRepository.findByDisplayName("name"))
                .thenReturn(Optional.of(TestUtils.newPublisher(1, "p@test.com", Provider.Status.ACCEPTED)));

        assertThat(authService.checkDisplayName("name").get("exists")).isTrue();
    }

    @Test
    void checkDisplayName_takenByDeveloper() {
        when(developerRepository.findByDisplayName("name"))
                .thenReturn(Optional.of(TestUtils.newDeveloper(1, "d@test.com", Provider.Status.ACCEPTED)));

        assertThat(authService.checkDisplayName("name").get("exists")).isTrue();
    }

    @Test
    void checkDisplayName_free() {
        when(developerRepository.findByDisplayName("name")).thenReturn(Optional.empty());
        when(publisherRepository.findByDisplayName("name")).thenReturn(Optional.empty());

        assertThat(authService.checkDisplayName("name").get("exists")).isFalse();
    }
}
