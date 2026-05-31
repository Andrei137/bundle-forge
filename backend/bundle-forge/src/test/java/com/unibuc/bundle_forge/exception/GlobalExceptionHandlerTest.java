package com.unibuc.bundle_forge.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.http.MockHttpInputMessage;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @SuppressWarnings("unchecked")
    private static Map<String, Object> bodyAsMap(ResponseEntity<?> response) {
        return (Map<String, Object>) response.getBody();
    }

    @Test
    void handleValidationException_returns400WithMessage() {
        ResponseEntity<?> response = handler.handleValidationException(
                new ValidationException("Invalid age %d", 17));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(bodyAsMap(response)).containsEntry("error", "Invalid age 17");
    }

    @Test
    void handleHttpMessageNotReadable_missingBody_returnsExplanatoryMessage() {
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException(
                "Required request body is missing for some controller",
                new MockHttpInputMessage(new byte[0]));

        ResponseEntity<?> response = handler.handleHttpMessageNotReadableException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(bodyAsMap(response)).containsEntry("error", "Request body is missing");
    }

    @Test
    void handleHttpMessageNotReadable_malformedBody_returnsGenericMessage() {
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException(
                "Cannot deserialize",
                new MockHttpInputMessage(new byte[0]));

        ResponseEntity<?> response = handler.handleHttpMessageNotReadableException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(bodyAsMap(response)).containsEntry("error", "Malformed request body");
    }

    @Test
    void handleMethodArgumentTypeMismatch_returns400WithParamName() {
        MethodArgumentTypeMismatchException ex = new MethodArgumentTypeMismatchException(
                "abc", Integer.class, "id", null, new IllegalArgumentException("nope"));

        ResponseEntity<?> response = handler.handleMethodArgumentTypeMismatch(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(bodyAsMap(response).get("error").toString())
                .contains("id")
                .contains("Integer");
    }

    @Test
    void handleMissingParameter_returns400WithName() {
        MissingServletRequestParameterException ex =
                new MissingServletRequestParameterException("q", "String");

        ResponseEntity<?> response = handler.handleMissingParameter(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(bodyAsMap(response).get("error").toString()).contains("'q'");
    }

    @Test
    void handleConstraintViolation_singleError_returnsScalar() {
        ConstraintViolation<?> violation = mock(ConstraintViolation.class);
        when(violation.getMessage()).thenReturn("must not be blank");
        Set<ConstraintViolation<?>> violations = Set.of(violation);

        ResponseEntity<?> response = handler.handleConstraintViolation(
                new ConstraintViolationException(violations));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(bodyAsMap(response)).containsEntry("error", "must not be blank");
    }

    @Test
    void handleUnauthorized_returns401NoBody() {
        ResponseEntity<?> response = handler.handleUnauthorized(new UnauthorizedException());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNull();
    }

    @Test
    void handleForbidden_acceptsAccessDeniedException() {
        ResponseEntity<?> response = handler.handleForbidden(new AccessDeniedException("nope"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(bodyAsMap(response)).containsEntry("error", "nope");
    }

    @Test
    void handleForbidden_fallsBackWhenMessageMissing() {
        ResponseEntity<?> response = handler.handleForbidden(new AccessDeniedException(null));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(bodyAsMap(response)).containsEntry("error", "Access denied");
    }

    @Test
    void handleNotFound_acceptsNotFoundException() {
        ResponseEntity<?> response = handler.handleNotFoundException(
                new NotFoundException("Game 42 not found"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(bodyAsMap(response)).containsEntry("error", "Game 42 not found");
    }

    @Test
    void handleNotFound_acceptsEntityNotFound() {
        ResponseEntity<?> response = handler.handleNotFoundException(
                new EntityNotFoundException("missing"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void handleNotFound_acceptsNoResourceFound() {
        ResponseEntity<?> response = handler.handleNotFoundException(
                new NoResourceFoundException(org.springframework.http.HttpMethod.GET, "/missing", "/missing"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void handleMethodNotSupported_returns405WithMethodName() {
        ResponseEntity<?> response = handler.handleMethodNotSupported(
                new HttpRequestMethodNotSupportedException("PATCH"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
        assertThat(bodyAsMap(response).get("error").toString()).contains("PATCH");
    }

    @Test
    void handleUnsupportedMediaType_returns415() {
        ResponseEntity<?> response = handler.handleUnsupportedMediaType(
                new HttpMediaTypeNotSupportedException(MediaType.TEXT_PLAIN, List.of(MediaType.APPLICATION_JSON)));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        assertThat(bodyAsMap(response).get("error").toString()).contains("text/plain");
    }

    @Test
    void handleConflict_customConflictException_usesItsMessage() {
        ResponseEntity<?> response = handler.handleConflict(
                new ConflictException("duplicate %s", "email"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(bodyAsMap(response)).containsEntry("error", "duplicate email");
    }

    @Test
    void handleConflict_dataIntegrity_usesGenericMessage() {
        ResponseEntity<?> response = handler.handleConflict(
                new DataIntegrityViolationException("ugly SQL details"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(bodyAsMap(response).get("error").toString())
                .doesNotContain("SQL")
                .contains("conflicts");
    }

    @Test
    void handlePayloadTooLarge_customException_usesItsMessage() {
        ResponseEntity<?> response = handler.handlePayloadTooLarge(
                new PayloadTooLargeException("Image must be smaller than 5MB"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.PAYLOAD_TOO_LARGE);
        assertThat(bodyAsMap(response)).containsEntry("error", "Image must be smaller than 5MB");
    }

    @Test
    void handlePayloadTooLarge_maxUploadSize_usesGenericMessage() {
        ResponseEntity<?> response = handler.handlePayloadTooLarge(
                new MaxUploadSizeExceededException(5_000_000L));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.PAYLOAD_TOO_LARGE);
        assertThat(bodyAsMap(response)).containsEntry("error", "Uploaded file is too large");
    }

    @Test
    void handleUnexpected_returns500WithGenericMessage() {
        ResponseEntity<?> response = handler.handleUnexpected(
                new RuntimeException("internals leak"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(bodyAsMap(response).get("error").toString())
                .doesNotContain("internals leak")
                .contains("unexpected error");
    }
}
