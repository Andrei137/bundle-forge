package com.unibuc.bundle_forge.exception;

public final class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }

    public ConflictException(String template, Object... args) {
        super(String.format(template, args));
    }
}
