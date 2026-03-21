package com.unibuc.bundle_forge.annotation;

import com.unibuc.bundle_forge.model.Provider;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireProvider {
    Class<? extends Provider>[] value() default {};
}
