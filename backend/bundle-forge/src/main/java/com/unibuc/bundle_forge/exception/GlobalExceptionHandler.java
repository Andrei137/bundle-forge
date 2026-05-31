package com.unibuc.bundle_forge.exception;

import com.unibuc.bundle_forge.utils.ResponseUtils;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import tools.jackson.databind.exc.InvalidFormatException;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestControllerAdvice
public final class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        List<String> errorsList = new ArrayList<>();
        ex
                .getBindingResult()
                .getFieldErrors()
                .forEach(error -> errorsList.add(error.getDefaultMessage()));
        Object responseBody;
        if (errorsList.size() == 1) {
            responseBody = errorsList.get(0);
        } else {
            responseBody = errorsList;
        }
        return ResponseUtils.badRequest(responseBody);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        if (ex.getCause() instanceof InvalidFormatException invalidFormatEx) {
            List<String> errorsList = new ArrayList<>();
            invalidFormatEx.getPath().forEach(ref -> {
                errorsList.add("Invalid date value. Please use the correct format (yyyy-mm-dd)");
            });
            return ResponseUtils.badRequest(errorsList);
        }
        String message = ex.getMessage();
        if (message != null && message.contains("Required request body is missing")) {
            return ResponseUtils.badRequest("Request body is missing");
        }
        return ResponseUtils.badRequest("Malformed request body");
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<?> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String required = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "expected type";
        String message = String.format("Parameter '%s' must be of type %s", ex.getName(), required);
        return ResponseUtils.badRequest(message);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<?> handleMissingParameter(MissingServletRequestParameterException ex) {
        String message = String.format("Missing required parameter '%s'", ex.getParameterName());
        return ResponseUtils.badRequest(message);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<?> handleConstraintViolation(ConstraintViolationException ex) {
        List<String> errors = ex.getConstraintViolations().stream()
                .map(v -> v.getMessage())
                .toList();
        if (errors.size() == 1) {
            return ResponseUtils.badRequest(errors.get(0));
        }
        return ResponseUtils.badRequest(errors);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<?> handleValidationException(ValidationException ex) {
        log.debug("Validation rejected: {}", ex.getMessage());
        return ResponseUtils.badRequest(ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<?> handleUnauthorized(UnauthorizedException ex) {
        return ResponseUtils.unauthorized();
    }

    @ExceptionHandler({ForbiddenException.class, AccessDeniedException.class})
    public ResponseEntity<?> handleForbidden(RuntimeException ex) {
        String message = ex.getMessage() != null ? ex.getMessage() : "Access denied";
        return ResponseUtils.forbidden(message);
    }

    @ExceptionHandler({
            NotFoundException.class,
            EntityNotFoundException.class,
            NoHandlerFoundException.class,
            NoResourceFoundException.class
    })
    public ResponseEntity<?> handleNotFoundException(Exception ex) {
        String message = ex.getMessage() != null ? ex.getMessage() : "Resource not found";
        return ResponseUtils.notFound(message);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<?> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        String message = String.format("HTTP method '%s' is not supported for this endpoint", ex.getMethod());
        return ResponseUtils.methodNotAllowed(message);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<?> handleUnsupportedMediaType(HttpMediaTypeNotSupportedException ex) {
        String contentType = ex.getContentType() != null ? ex.getContentType().toString() : "unknown";
        String message = String.format("Media type '%s' is not supported", contentType);
        return ResponseUtils.unsupportedMediaType(message);
    }

    @ExceptionHandler({ConflictException.class, DataIntegrityViolationException.class})
    public ResponseEntity<?> handleConflict(Exception ex) {
        log.warn("Conflict: {}", ex.getMessage());
        String message = ex instanceof ConflictException
                ? ex.getMessage()
                : "The request conflicts with the current state of the resource";
        return ResponseUtils.conflict(message);
    }

    @ExceptionHandler({MaxUploadSizeExceededException.class, PayloadTooLargeException.class})
    public ResponseEntity<?> handlePayloadTooLarge(Exception ex) {
        String message = ex instanceof PayloadTooLargeException
                ? ex.getMessage()
                : "Uploaded file is too large";
        return ResponseUtils.payloadTooLarge(message);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseUtils.serverError("An unexpected error occurred. Please try again later.");
    }

}
