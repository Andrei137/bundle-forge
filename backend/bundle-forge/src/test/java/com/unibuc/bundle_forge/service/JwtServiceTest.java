package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.exception.UnauthorizedException;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.model.User;
import com.unibuc.bundle_forge.repository.UserRepository;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class JwtServiceTest {

    private static final String TEST_SECRET = "59ea8c46bff1d4e107b627cb853e06d522de5e592ece36d718b1244442b324f2";

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication auth;

    @InjectMocks
    private JwtService jwtService = new JwtService(TEST_SECRET);

    private Customer customer;
    private Publisher publisher;

    @BeforeEach
    void setUp() {
        customer = TestUtils.customer1;
        publisher = TestUtils.publisher1;
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getToken_and_extractUserId_success() {
        String token = jwtService.getToken("admin");
        String extracted = jwtService.extractUserId(token);

        assertEquals("admin", extracted);
    }

    @Test
    void encryptPassword_success() {
        String rawPassword = "SECRET_PASSWORD_123!";
        String encoded = JwtService.encryptPassword(rawPassword);

        assertNotEquals(rawPassword, encoded);
        assertTrue(JwtService.isPasswordValid(rawPassword, encoded));
    }

    @Test
    void checkAdmin_adminUser_ok() {
        when(auth.getPrincipal()).thenReturn("admin");
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertDoesNotThrow(() -> jwtService.checkAdmin());

        verify(auth, times(1)).getPrincipal();
    }

    @Test
    void checkAdmin_nonAdmin_throwsException() {
        when(auth.getPrincipal()).thenReturn("nonAdmin");
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertThrows(UnauthorizedException.class, () -> jwtService.checkAdmin());
    }

    @Test
    void checkAdmin_noAuth_throwsException() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () -> jwtService.checkAdmin());
    }

    @Test
    void getUser_validUser_success() {
        when(auth.getPrincipal()).thenReturn(customer.getId().toString());
        when(userRepository.findById(customer.getId())).thenReturn(Optional.of(customer));

        SecurityContextHolder.getContext().setAuthentication(auth);

        User result = jwtService.getCurrentUser();

        assertEquals(customer.getId(), result.getId());
        assertEquals(customer.getUsername(), result.getUsername());

        verify(auth, times(1)).getPrincipal();
        verify(userRepository, times(1)).findById(argThat(id -> id.equals(customer.getId())));
    }

    @Test
    void getUser_userNotFound_throwsException() {
        when(auth.getPrincipal()).thenReturn("404");
        when(userRepository.findById(404)).thenReturn(Optional.empty());

        SecurityContextHolder.getContext().setAuthentication(auth);

        assertThrows(UnauthorizedException.class, () -> jwtService.getCurrentUser());

        verify(auth, times(1)).getPrincipal();
        verify(userRepository, times(1)).findById(argThat(id -> id.equals(404)));
    }

    @Test
    void getUser_noAuthentication_throwsException() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () -> jwtService.getCurrentUser());
    }

    @Test
    void getCustomer_validCustomer_success() {
        when(auth.getPrincipal()).thenReturn(customer.getId().toString());
        when(userRepository.findById(customer.getId())).thenReturn(Optional.of(customer));

        SecurityContextHolder.getContext().setAuthentication(auth);

        User result = jwtService.getCurrentCustomer();

        assertEquals(customer.getId(), result.getId());
        assertEquals(customer.getUsername(), result.getUsername());

        verify(auth, times(1)).getPrincipal();
        verify(userRepository, times(1)).findById(argThat(id -> id.equals(customer.getId())));
    }

    @Test
    void getCustomer_invalidCustomer_success() {
        when(auth.getPrincipal()).thenReturn(publisher.getId().toString());
        when(userRepository.findById(publisher.getId())).thenReturn(Optional.of(publisher));

        SecurityContextHolder.getContext().setAuthentication(auth);

        User result = jwtService.getCurrentCustomer();

        assertNull(result);

        verify(auth, times(1)).getPrincipal();
        verify(userRepository, times(1)).findById(argThat(id -> id.equals(publisher.getId())));
    }

    @Test
    void getProvider_validProvider_success() {
        when(auth.getPrincipal()).thenReturn(publisher.getId().toString());
        when(userRepository.findById(publisher.getId())).thenReturn(Optional.of(publisher));

        SecurityContextHolder.getContext().setAuthentication(auth);

        User result = jwtService.getCurrentProvider();

        assertEquals(publisher.getId(), result.getId());
        assertEquals(publisher.getUsername(), result.getUsername());

        verify(auth, times(1)).getPrincipal();
        verify(userRepository, times(1)).findById(argThat(id -> id.equals(publisher.getId())));
    }

    @Test
    void getProvider_invalidProvider_success() {
        when(auth.getPrincipal()).thenReturn(customer.getId().toString());
        when(userRepository.findById(customer.getId())).thenReturn(Optional.of(customer));

        SecurityContextHolder.getContext().setAuthentication(auth);

        User result = jwtService.getCurrentProvider();

        assertNull(result);

        verify(auth, times(1)).getPrincipal();
        verify(userRepository, times(1)).findById(argThat(id -> id.equals(customer.getId())));
    }
}
