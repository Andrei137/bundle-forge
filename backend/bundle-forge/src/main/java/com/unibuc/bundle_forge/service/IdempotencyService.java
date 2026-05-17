package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.PaymentResponseDto;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private static final String PREFIX = "idem:payment:";
    private static final Duration TTL = Duration.ofHours(24);

    private final StringRedisTemplate redis;
    private final ObjectMapper mapper = JsonMapper.builder().build();

    public PaymentResponseDto get(String key) {
        if (key == null || key.isBlank()) return null;
        try {
            String json = redis.opsForValue().get(PREFIX + key);
            if (json == null) return null;
            return mapper.readValue(json, PaymentResponseDto.class);
        } catch (Exception e) {
            log.warn("Failed to read idempotent response for key {}", key, e);
            return null;
        }
    }

    public void store(String key, PaymentResponseDto response) {
        if (key == null || key.isBlank() || response == null) return;
        try {
            redis.opsForValue().set(PREFIX + key, mapper.writeValueAsString(response), TTL);
        } catch (Exception e) {
            log.warn("Failed to cache idempotent response for key {}", key, e);
        }
    }
}
