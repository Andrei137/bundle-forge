package com.unibuc.bundle_forge.aspect;

import com.unibuc.bundle_forge.annotation.RequireProvider;
import com.unibuc.bundle_forge.exception.ForbiddenException;
import com.unibuc.bundle_forge.exception.UnauthorizedException;
import com.unibuc.bundle_forge.model.Customer;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
@RequiredArgsConstructor
public final class RoleAuthorizationAspect {

    private final JwtService jwtService;

    private void checkAuthorization(Class<?>... classes) {
        Object user = jwtService.getCurrentUser();
        if (Arrays.stream(classes).noneMatch(_class -> _class.isInstance(user))) {
            throw new UnauthorizedException();
        }
    }

    @Before("@annotation(com.unibuc.bundle_forge.annotation.RequireAdmin)")
    public void checkAdminAuthorization() {
        jwtService.checkAdmin();
    }

    @Before("@annotation(com.unibuc.bundle_forge.annotation.RequireCustomer)")
    public void checkCustomerAuthorization() {
        checkAuthorization(Customer.class);
    }

    @Before("@annotation(requireProvider)")
    public void checkProviderAuthorization(RequireProvider requireProvider) {
        checkAuthorization(requireProvider.value());
        if (!jwtService.getCurrentProvider().getStatus().equals(Provider.Status.ACCEPTED)) {
            throw new ForbiddenException("You are banned");
        }
    }

}