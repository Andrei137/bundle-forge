package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.FeaturedItemDto;
import com.unibuc.bundle_forge.model.Bundle;
import com.unibuc.bundle_forge.model.BundleTier;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.repository.BundleRepository;
import com.unibuc.bundle_forge.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TopSellerService {

    private static final int LIMIT = 12;

    private final GameRepository gameRepository;
    private final BundleRepository bundleRepository;

    public List<FeaturedItemDto> getTopSellers(String filter) {
        String f = filter == null ? "ALL" : filter.toUpperCase();
        List<FeaturedItemDto> result = switch (f) {
            case "GAMES"   -> gamesOnly();
            case "BUNDLES" -> bundlesOnly();
            default        -> allMixed();
        };
        return result.stream().limit(LIMIT).toList();
    }

    private record Ranked(FeaturedItemDto dto, int salesCount, int discount) {}

    private List<FeaturedItemDto> gamesOnly() {
        return gameRepository.findByStatus(Game.Status.PUBLISHED).stream()
                .map(g -> new Ranked(toGameDto(g), g.getSalesCount(), g.getDiscountPercentage()))
                .sorted(TopSellerService::byRank)
                .map(Ranked::dto)
                .toList();
    }

    private List<FeaturedItemDto> bundlesOnly() {
        return bundleRepository.findAll().stream()
                .map(b -> new Ranked(toBundleDto(b), b.getSalesCount(), 0))
                .sorted(TopSellerService::byRank)
                .map(Ranked::dto)
                .toList();
    }

    private List<FeaturedItemDto> allMixed() {
        List<Ranked> items = new ArrayList<>();
        for (Game g : gameRepository.findByStatus(Game.Status.PUBLISHED)) {
            items.add(new Ranked(toGameDto(g), g.getSalesCount(), g.getDiscountPercentage()));
        }
        for (Bundle b : bundleRepository.findAll()) {
            items.add(new Ranked(toBundleDto(b), b.getSalesCount(), 0));
        }
        items.sort(TopSellerService::byRank);
        return items.stream().map(Ranked::dto).toList();
    }

    private static int byRank(Ranked a, Ranked b) {
        int cmp = Integer.compare(b.salesCount(), a.salesCount());
        if (cmp != 0) return cmp;
        return Integer.compare(b.discount(), a.discount());
    }

    private FeaturedItemDto toGameDto(Game game) {
        return FeaturedItemDto.builder()
                .id(game.getId())
                .type("GAME")
                .title(game.getTitle())
                .cover(game.getCover())
                .price(game.getPrice())
                .discountPercentage(game.getDiscountPercentage() != null ? game.getDiscountPercentage() : 0)
                .developer(game.getDeveloper() != null ? game.getDeveloper().getDisplayName() : null)
                .platforms(game.getSystemRequirements() != null ? new java.util.ArrayList<>(game.getSystemRequirements().keySet()) : java.util.List.of())
                .build();
    }

    private FeaturedItemDto toBundleDto(Bundle bundle) {
        Double price = bundle.getTiers().stream()
                .min(Comparator.comparing(BundleTier::getNumRequiredGames))
                .map(t -> t.getPricePerGame() * t.getNumRequiredGames())
                .orElse(null);
        return FeaturedItemDto.builder()
                .id(bundle.getId())
                .type("BUNDLE")
                .title(bundle.getTitle())
                .cover(bundle.getCover())
                .price(price)
                .discountPercentage(0)
                .build();
    }
}
