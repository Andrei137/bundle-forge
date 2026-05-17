package com.unibuc.bundle_forge.utils;

import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.service.JwtService;

public final class TestUtils {

    private TestUtils() {
    }

    public static final String RAW_PASSWORD = "Secret__123";

    public static Customer newCustomer(Integer id, String email) {
        return Customer.builder()
                .id(id)
                .email(email)
                .password(JwtService.encryptPassword(RAW_PASSWORD))
                .firstName("First")
                .lastName("Last")
                .phoneNumber("07" + String.format("%08d", id))
                .build();
    }

    public static Developer newDeveloper(Integer id, String email, Provider.Status status) {
        return Developer.builder()
                .id(id)
                .email(email)
                .password(JwtService.encryptPassword(RAW_PASSWORD))
                .website("https://" + email.split("@")[0] + ".test")
                .displayName("dev-" + id)
                .status(status)
                .build();
    }

    public static Publisher newPublisher(Integer id, String email, Provider.Status status) {
        return Publisher.builder()
                .id(id)
                .email(email)
                .password(JwtService.encryptPassword(RAW_PASSWORD))
                .website("https://" + email.split("@")[0] + ".test")
                .displayName("pub-" + id)
                .status(status)
                .build();
    }

}
