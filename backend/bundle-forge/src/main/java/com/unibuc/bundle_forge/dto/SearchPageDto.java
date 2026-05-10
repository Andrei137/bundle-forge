package com.unibuc.bundle_forge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SearchPageDto {
    private List<SearchItemDto> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
