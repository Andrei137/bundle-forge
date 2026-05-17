package com.unibuc.bundle_forge.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public final class LoggingAspect {

    // Scoped to controllers — they're the request boundary, and unlike several services
    // (AuthService, JwtService, …) they're not declared `final`, so Spring can proxy them.
    @Pointcut("within(com.unibuc.bundle_forge.controller..*)")
    public void appComponents() {}

    @Around("appComponents()")
    public Object traceMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        Logger logger = LoggerFactory.getLogger(joinPoint.getSignature().getDeclaringTypeName());

        if (logger.isDebugEnabled()) {
            logger.debug("→ {}({})",
                    joinPoint.getSignature().getName(),
                    joinPoint.getArgs().length);
        }

        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            if (logger.isDebugEnabled()) {
                logger.debug("← {} ({} ms)",
                        joinPoint.getSignature().getName(),
                        System.currentTimeMillis() - start);
            }
            return result;
        } catch (Throwable t) {
            // Re-thrown — caller still gets the exception; we just record it.
            logger.debug("✗ {} threw {}: {} ({} ms)",
                    joinPoint.getSignature().getName(),
                    t.getClass().getSimpleName(),
                    t.getMessage(),
                    System.currentTimeMillis() - start);
            throw t;
        }
    }

    @AfterThrowing(pointcut = "appComponents()", throwing = "ex")
    public void logUnexpectedException(org.aspectj.lang.JoinPoint joinPoint, Throwable ex) {
        Logger logger = LoggerFactory.getLogger(joinPoint.getSignature().getDeclaringTypeName());
        // Domain exceptions (Validation/NotFound/Forbidden/Unauthorized) are part of the
        // request flow and translated to 4xx by GlobalExceptionHandler — they don't deserve
        // ERROR. Everything else is unexpected.
        String name = ex.getClass().getName();
        if (name.startsWith("com.unibuc.bundle_forge.exception.")) {
            return;
        }
        logger.error("Unhandled exception in {}.{}: {}",
                joinPoint.getSignature().getDeclaringType().getSimpleName(),
                joinPoint.getSignature().getName(),
                ex.getMessage(),
                ex);
    }
}
