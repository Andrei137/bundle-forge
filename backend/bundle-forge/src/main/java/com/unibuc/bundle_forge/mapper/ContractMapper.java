package com.unibuc.bundle_forge.mapper;

import com.unibuc.bundle_forge.dto.ContractDto;
import com.unibuc.bundle_forge.model.Contract;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public final class ContractMapper {

    public void updateEntityFromDto(ContractDto dto, Contract entity) {
        Optional.ofNullable(dto.getCutPercentage()).ifPresent(entity::setCutPercentage);
        Optional.ofNullable(dto.getExpiryDate()).ifPresent(entity::setExpiryDate);
    }

    public Contract toEntity(ContractDto dto) {
        var builder = Contract.builder()
                .id(new Contract.ContractId())
                .createdAt(LocalDate.now())
                .expiryDate(dto.getExpiryDate())
                .status(Contract.Status.PENDING);
        Optional.ofNullable(dto.getCutPercentage())
                .ifPresent(builder::cutPercentage);
        return builder.build();
    }

}
