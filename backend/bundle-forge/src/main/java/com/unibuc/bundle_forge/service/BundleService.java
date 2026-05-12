package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.*;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.model.Bundle;
import com.unibuc.bundle_forge.model.BundleTier;
import com.unibuc.bundle_forge.model.CharityFounder;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.repository.BundleRepository;
import com.unibuc.bundle_forge.repository.GameRepository;
import com.unibuc.bundle_forge.utils.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BundleService {

    private final BundleRepository bundleRepository;
    private final GameRepository gameRepository;
    private final ImageService imageService;
    private final CharityFounderService charityFounderService;

    public List<BundleResponseDto> getAllBundles() {
        return bundleRepository.findAll().stream().map(this::toResponseDto).toList();
    }

    public BundleResponseDto getBundle(Integer id) {
        return toResponseDto(bundleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(String.format("Bundle with id %d not found", id))));
    }

    public BundleResponseDto createBundle(BundleCreateDto dto, MultipartFile coverFile) {
        String cover = imageService.uploadImage(coverFile);
        Bundle bundle = buildBundle(dto, cover);
        return toResponseDto(bundleRepository.save(bundle));
    }

    public BundleResponseDto updateBundle(Integer id, BundleCreateDto dto, MultipartFile coverFile) {
        Bundle bundle = bundleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(String.format("Bundle with id %d not found", id)));

        if (coverFile != null && !coverFile.isEmpty()) {
            imageService.deleteImage(bundle.getCover());
            bundle.setCover(imageService.uploadImage(coverFile));
        }
        bundle.setTitle(dto.getTitle());
        bundle.setShortDescription(dto.getShortDescription());
        bundle.setLongDescription(dto.getLongDescription());
        bundle.setPlatformMinPct(dto.getPlatformMinPct());
        bundle.setDevMinPct(dto.getDevMinPct());
        bundle.setDaysLeft(dto.getDaysLeft());
        bundle.setGames(gameRepository.findAllById(dto.getGameIds()));
        bundle.setTiers(toTiers(dto.getTiers()));
        bundle.setCharityFounder(resolveCharity(dto.getCharityFounderId()));

        return toResponseDto(bundleRepository.save(bundle));
    }

    public ResponseEntity<Void> deleteBundle(Integer id) {
        Bundle bundle = bundleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(String.format("Bundle with id %d not found", id)));
        imageService.deleteImage(bundle.getCover());
        bundleRepository.delete(bundle);
        return ResponseUtils.noContent();
    }

    private Bundle buildBundle(BundleCreateDto dto, String cover) {
        return Bundle.builder()
                .title(dto.getTitle())
                .cover(cover)
                .shortDescription(dto.getShortDescription())
                .longDescription(dto.getLongDescription())
                .platformMinPct(dto.getPlatformMinPct())
                .devMinPct(dto.getDevMinPct())
                .daysLeft(dto.getDaysLeft())
                .games(gameRepository.findAllById(dto.getGameIds()))
                .tiers(toTiers(dto.getTiers()))
                .charityFounder(resolveCharity(dto.getCharityFounderId()))
                .build();
    }

    private CharityFounder resolveCharity(Integer id) {
        return id != null ? charityFounderService.findById(id) : null;
    }

    private List<BundleTier> toTiers(List<BundleCreateDto.TierDto> dtos) {
        return dtos.stream()
                .map(t -> BundleTier.builder()
                        .numRequiredGames(t.getNumRequiredGames())
                        .pricePerGame(t.getPricePerGame())
                        .build())
                .toList();
    }

    private BundleResponseDto toResponseDto(Bundle bundle) {
        return BundleResponseDto.builder()
                .id(bundle.getId())
                .title(bundle.getTitle())
                .cover(bundle.getCover())
                .shortDescription(bundle.getShortDescription())
                .longDescription(bundle.getLongDescription())
                .platformMinPct(bundle.getPlatformMinPct())
                .devMinPct(bundle.getDevMinPct())
                .daysLeft(bundle.getDaysLeft())
                .games(bundle.getGames().stream().map(this::toGameDto).toList())
                .tiers(bundle.getTiers().stream()
                        .sorted(Comparator.comparingInt(BundleTier::getNumRequiredGames))
                        .map(t -> new BundleTierDto(t.getNumRequiredGames(), t.getPricePerGame()))
                        .toList())
                .charity(bundle.getCharityFounder() != null
                        ? charityFounderService.toDto(bundle.getCharityFounder())
                        : null)
                .build();
    }

    private BundleGameDto toGameDto(Game game) {
        List<String> platforms = game.getSystemRequirements() == null ? List.of() :
                game.getSystemRequirements().keySet().stream()
                        .map(this::normalizePlatform)
                        .filter(p -> p != null)
                        .toList();
        return BundleGameDto.builder()
                .id(game.getId())
                .title(game.getTitle())
                .cover(game.getCover())
                .rrp(game.getPrice())
                .platforms(platforms)
                .build();
    }

    private String normalizePlatform(String key) {
        return switch (key.toLowerCase()) {
            case "windows" -> "win";
            case "macos" -> "mac";
            case "linux" -> "linux";
            default -> null;
        };
    }
}
