package com.unibuc.bundle_forge.exception;

import com.unibuc.bundle_forge.utils.ResponseUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
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
        if (message.contains("Required request body is missing")) {
            return ResponseUtils.badRequest("Request body is missing");
        }
        return ResponseUtils.badRequest(message);
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

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<?> handleForbidden(ForbiddenException ex) {
        return ResponseUtils.forbidden(ex.getMessage());
    }

    @ExceptionHandler({NotFoundException.class, EntityNotFoundException.class})
    public ResponseEntity<?> handleNotFoundException(NotFoundException ex) {
        return ResponseUtils.notFound(ex.getMessage());
    }


}