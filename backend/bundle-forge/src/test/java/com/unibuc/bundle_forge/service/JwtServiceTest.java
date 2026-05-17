package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.exception.UnauthorizedException;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.repository.UserRepository;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    private static final String TEST_SECRET =
            "dGVzdC1zZWNyZXQta2V5LWZvci1qd3QtdGVzdGluZy1wdXJwb3Nlcy1vbmx5LXBsZWFzZS1jaGFuZ2U=";

    @Mock
    private UserRepository userRepository;

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "userRepository", userRepository);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void encryptPassword_returnsNonNullHash() {
        String hash = JwtService.encryptPassword("hello");
        assertThat(hash).isNotBlank().isNotEqualTo("hello");
    }

    @Test
    void isPasswordValid_matches() {
        String hash = JwtService.encryptPassword("hello");
        assertThat(JwtService.isPasswordValid("hello", hash)).isTrue();
        assertThat(JwtService.isPasswordValid("wrong", hash)).isFalse();
    }

    @Test
    void getToken_andExtract_roundtrip() {
        String token = jwtService.getToken("42");
        assertThat(jwtService.extractUserId(token)).isEqualTo("42");
    }

    @Test
    void getCurrentUser_noAuthentication_throws() {
        SecurityContextHolder.clearContext();
        assertThatThrownBy(() -> jwtService.getCurrentUser())
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void getCurrentUser_authenticatedCustomer_returnsCustomer() {
        Customer customer = TestUtils.newCustomer(1, "c@test.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("1", "n/a", java.util.List.of()));
        when(userRepository.findById(1)).thenReturn(Optional.of(customer));

        assertThat(jwtService.getCurrentUser()).isSameAs(customer);
        assertThat(jwtService.getCurrentCustomer()).isSameAs(customer);
        assertThat(jwtService.getCurrentProvider()).isNull();
    }

    @Test
    void getCurrentProvider_returnsProvider() {
        Developer dev = TestUtils.newDeveloper(2, "d@test.com", Provider.Status.ACCEPTED);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("2", "n/a", java.util.List.of()));
        when(userRepository.findById(2)).thenReturn(Optional.of(dev));

        assertThat(jwtService.getCurrentProvider()).isSameAs(dev);
        assertThat(jwtService.getCurrentCustomer()).isNull();
    }

    @Test
    void getCurrentUser_missingUser_throws() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("99", "n/a", java.util.List.of()));
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jwtService.getCurrentUser())
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void checkAdmin_nonAdmin_throws() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("1", "n/a", java.util.List.of()));

        assertThatThrownBy(() -> jwtService.checkAdmin())
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void checkAdmin_admin_ok() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin", "n/a", java.util.List.of()));

        jwtService.checkAdmin();
    }
}
