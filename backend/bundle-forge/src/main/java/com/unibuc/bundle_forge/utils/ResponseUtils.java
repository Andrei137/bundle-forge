package com.unibuc.bundle_forge.utils;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public final class ResponseUtils {

    private ResponseUtils() {
    }

    private static <T> ResponseEntity<T> response(T obj, HttpStatus status) {
        return ResponseEntity.status(status).body(obj);
    }

    private static ResponseEntity<Void> response(HttpStatus status) {
        return ResponseEntity.status(status).build();
    }

    public static <T> ResponseEntity<Map<String, T>> error(T error, HttpStatus status) {
        String key = "error";
        if (error instanceof Iterable<?>) key = key.concat("s");
        return response(Map.of(key, error), status);
    }

    public static ResponseEntity<Void> error(HttpStatus status) {
        return response(null, status);
    }

    public static <T> ResponseEntity<T> ok(T obj) {
        return response(obj, HttpStatus.OK);
    }

    public static <T> ResponseEntity<T> created(T obj) {
        return response(obj, HttpStatus.CREATED);
    }

    public static ResponseEntity<Void> noContent() {
        return response(HttpStatus.NO_CONTENT);
    }

    public static <T> ResponseEntity<Map<String, T>> badRequest(T err) {
        return error(err, HttpStatus.BAD_REQUEST);
    }

    public static ResponseEntity<Void> unauthorized() {
        return error(HttpStatus.UNAUTHORIZED);
    }

    public static <T> ResponseEntity<Map<String, T>> forbidden(T err) {
        return error(err, HttpStatus.FORBIDDEN);
    }

    public static <T> ResponseEntity<Map<String, T>> notFound(T err) {
        return error(err, HttpStatus.NOT_FOUND);
    }

}