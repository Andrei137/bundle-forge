package com.unibuc.bundle_forge.utils;

import java.util.function.Consumer;

public class MapperUtils {
    public static <T> void setIfPresent(T value, Consumer<T> setter) {
        if (value != null) setter.accept(value);
    }
}
