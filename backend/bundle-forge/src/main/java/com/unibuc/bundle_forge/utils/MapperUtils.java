package com.unibuc.bundle_forge.utils;

import com.unibuc.bundle_forge.model.Website;

import java.util.function.Consumer;

public class MapperUtils {
    public static <T> void setIfPresent(T value, Consumer<T> setter) {
        if (value != null) setter.accept(value);
    }

    public static String websiteUrl(Website website) {
        return website == null ? null : website.getUrl();
    }

    public static Website applyWebsiteUrl(Website existing, String url) {
        if (url == null) return null;
        if (existing != null) {
            existing.setUrl(url);
            return existing;
        }
        return Website.builder().url(url).build();
    }
}
