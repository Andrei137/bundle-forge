package com.unibuc.bundle_forge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {
    private Integer gameId;
    private String title;
    private String cover;
    private Long unitAmount;
    private Integer quantity;
    private String gameKey;
}
