package com.unibuc.bundle_forge.utils;

import com.unibuc.bundle_forge.exception.ValidationException;

import java.util.Arrays;

public final class EnumUtils {

    public static <E extends Enum<E>> E fromString(Class<E> enumClass, String value) {
        if (value == null || value.isBlank()) return null;
        return Arrays.stream(enumClass.getEnumConstants())
                .filter(e -> e.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElseThrow(() -> new ValidationException("Invalid value '" + value + "' for status"));
    }

    public static <E extends Enum<E>> String toString(E value) {
        return value == null ? null : value.name().toLowerCase();
    }

    public interface HasStatus<E extends Enum<E>> {
        E getStatus();

        void setStatus(E status);
    }

    public interface TransitionAware<E extends Enum<E>> {
        boolean canTransitionFrom(E from);
    }

    public static <E extends Enum<E> & TransitionAware<E>> void updateStatus(
            String status,
            HasStatus<E> entity,
            Class<E> enumClass
    ) {
        if (status == null) return;

        E newStatus = fromString(enumClass, status);
        E currentStatus = entity.getStatus();
        if (newStatus.equals(currentStatus)) return;
        if (!newStatus.canTransitionFrom(currentStatus)) {
            throw new ValidationException(
                    String.format(
                            "Cannot change status from %s to %s",
                            toString(currentStatus),
                            toString(newStatus)
                    )
            );
        }

        entity.setStatus(newStatus);
    }
}
