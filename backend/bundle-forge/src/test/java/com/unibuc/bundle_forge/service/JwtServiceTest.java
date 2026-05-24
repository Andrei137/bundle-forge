package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.exception.UnauthorizedException;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.repository.UserRepository;
import com.unibuc.bundle_forge.utils.TestUtils;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    private static final String TEST_SECRET =
            "dGVzdC1zZWNyZXQta2V5LWZvci1qd3QtdGVzdGluZy1wdXJwb3Nlcy1vbmx5LXBsZWFzZS1jaGFuZ2U=";
    private static final long SHORT_TTL_MS = 60_000L;          // 1 min
    private static final long LONG_TTL_MS  = 7L * 24 * 3600_000L; // 7 days

    @Mock
    private UserRepository userRepository;

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(TEST_SECRET, SHORT_TTL_MS, LONG_TTL_MS);
        ReflectionTestUtils.setField(jwtService, "userRepository", userRepository);
    }

    private Date expiryOf(String token) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(TEST_SECRET));
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload().getExpiration();
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
    void getToken_rememberMeFalse_usesShortTtl() {
        long before = System.currentTimeMillis();
        Date exp = expiryOf(jwtService.getToken("1", false));
        long ttl = exp.getTime() - before;
        assertThat(ttl).isBetween(SHORT_TTL_MS - 1_000, SHORT_TTL_MS + 1_000);
    }

    @Test
    void getToken_rememberMeTrue_usesLongTtl() {
        long before = System.currentTimeMillis();
        Date exp = expiryOf(jwtService.getToken("1", true));
        long ttl = exp.getTime() - before;
        assertThat(ttl).isBetween(LONG_TTL_MS - 1_000, LONG_TTL_MS + 1_000);
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
