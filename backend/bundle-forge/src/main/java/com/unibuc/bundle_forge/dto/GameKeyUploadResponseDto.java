package com.unibuc.bundle_forge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class GameKeyUploadResponseDto {
    private int added;
    private int alreadyExisting;
    private List<String> duplicatesInFile;
    private List<String> invalidFormat;
    private long totalActiveKeys;
}
