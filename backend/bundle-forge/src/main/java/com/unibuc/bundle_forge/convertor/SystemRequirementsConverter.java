package com.unibuc.bundle_forge.convertor;

import com.unibuc.bundle_forge.dto.PlatformRequirements;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@Converter
public class SystemRequirementsConverter implements AttributeConverter<Map<String, PlatformRequirements>, String> {

    private final ObjectMapper objectMapper;

    public SystemRequirementsConverter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public String convertToDatabaseColumn(Map<String, PlatformRequirements> attribute) {
        try {
            if (attribute == null || attribute.isEmpty()) {
                return "{}";
            }

            return objectMapper.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new RuntimeException("Error converting systemRequirements to JSON", e);
        }
    }

    @Override
    public Map<String, PlatformRequirements> convertToEntityAttribute(String dbData) {
        try {
            if (dbData == null || dbData.isBlank()) {
                return new HashMap<>();
            }

            return objectMapper.readValue(
                    dbData,
                    new TypeReference<Map<String, PlatformRequirements>>() {}
            );
        } catch (Exception e) {
            throw new RuntimeException("Error reading systemRequirements JSON", e);
        }
    }

}