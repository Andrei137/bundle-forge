package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.FeaturedItemDto;
import com.unibuc.bundle_forge.dto.FeaturedSlideDto;
import com.unibuc.bundle_forge.model.Bundle;
import com.unibuc.bundle_forge.model.BundleTier;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.repository.BundleRepository;
import com.unibuc.bundle_forge.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class FeaturedService {

    private final GameRepository gameRepository;
    private final BundleRepository bundleRepository;

    public List<FeaturedSlideDto> getFeatured() {
        List<Game> published = gameRepository.findByStatus(Game.Status.PUBLISHED);
        List<Game> byDiscount = published.stream()
                .filter(g -> g.getDiscountPercentage() != null && g.getDiscountPercentage() > 0)
                .sorted(Comparator.comparing(Game::getDiscountPercentage).reversed())
                .toList();

        List<Game> byDate = published.stream()
                .sorted(Comparator.comparing(Game::getReleaseDate).reversed())
                .toList();

        List<Game> shuffled = new ArrayList<>(published);
        Collections.shuffle(shuffled);

        // Bundles sorted by first-tier pricePerGame ascending (cheapest entry point first)
        List<Bundle> byEntryPrice = bundleRepository.findAll().stream()
                .filter(b -> !b.getTiers().isEmpty())
                .sorted(Comparator.comparing(b -> b.getTiers().stream()
                        .min(Comparator.comparing(BundleTier::getNumRequiredGames))
                        .map(BundleTier::getPricePerGame)
                        .orElse(Double.MAX_VALUE)))
                .toList();

        List<FeaturedSlideDto> slides = new ArrayList<>();
        Set<String> used = new HashSet<>();

        // Slide 1: Biggest Deals — main = bundle with lowest first-tier pricePerGame,
        // support includes at least 1 more bundle + highest-discount games
        if (!byEntryPrice.isEmpty()) {
            Bundle mainBundle = byEntryPrice.get(0);
            used.add("BUNDLE:" + mainBundle.getId());

            List<FeaturedItemDto> support = new ArrayList<>();
            fillBundles(support, used, byEntryPrice, 1);   // guarantee 2nd bundle in support
            fillGames(support, used, byDiscount, 4);        // high-discount games fill remaining
            fillGames(support, used, byDate, 4);

            slides.add(FeaturedSlideDto.builder()
                    .label("Biggest Deals")
                    .main(toBundleDto(mainBundle))
                    .support(support)
                    .build());
        }

        // Slide 2: New Releases — main = newest unused game
        if (slides.size() < 4) {
            Game mainGame = firstUnusedGame(byDate, used);
            if (mainGame != null) {
                used.add("GAME:" + mainGame.getId());

                List<FeaturedItemDto> support = new ArrayList<>();
                fillGames(support, used, byDate, 4);
                fillBundles(support, used, byEntryPrice, 4);
                fillGames(support, used, shuffled, 4);

                slides.add(FeaturedSlideDto.builder()
                        .label("New Releases")
                        .main(toGameDto(mainGame))
                        .support(support)
                        .build());
            }
        }

        // Shared random pool for slides 3 & 4 — shuffled mix of games and bundles
        List<FeaturedItemDto> randomPool = buildRandomPool(shuffled, byEntryPrice);

        // Slide 3: Random pick (game or bundle)
        if (slides.size() < 4) {
            FeaturedItemDto main3 = firstUnusedFromPool(randomPool, used);
            if (main3 != null) {
                used.add(main3.getType() + ":" + main3.getId());

                List<FeaturedItemDto> support = new ArrayList<>();
                fillFromPool(support, used, randomPool, 4);

                slides.add(FeaturedSlideDto.builder()
                        .label("Bundle Spotlight")
                        .main(main3)
                        .support(support)
                        .build());
            }
        }

        // Slide 4: Random pick (game or bundle)
        if (slides.size() < 4) {
            FeaturedItemDto main4 = firstUnusedFromPool(randomPool, used);
            if (main4 != null) {
                used.add(main4.getType() + ":" + main4.getId());

                List<FeaturedItemDto> support = new ArrayList<>();
                fillFromPool(support, used, randomPool, 4);

                slides.add(FeaturedSlideDto.builder()
                        .label("Staff Picks")
                        .main(main4)
                        .support(support)
                        .build());
            }
        }

        return slides;
    }

    private void fillGames(List<FeaturedItemDto> support, Set<String> used, List<Game> pool, int max) {
        for (Game g : pool) {
            if (support.size() >= max) break;
            String key = "GAME:" + g.getId();
            if (!used.contains(key)) {
                support.add(toGameDto(g));
                used.add(key);
            }
        }
    }

    private void fillBundles(List<FeaturedItemDto> support, Set<String> used, List<Bundle> pool, int max) {
        for (Bundle b : pool) {
            if (support.size() >= max) break;
            String key = "BUNDLE:" + b.getId();
            if (!used.contains(key)) {
                support.add(toBundleDto(b));
                used.add(key);
            }
        }
    }

    private Game firstUnusedGame(List<Game> pool, Set<String> used) {
        return pool.stream().filter(g -> !used.contains("GAME:" + g.getId())).findFirst().orElse(null);
    }

    private Bundle firstUnusedBundle(List<Bundle> pool, Set<String> used) {
        return pool.stream().filter(b -> !used.contains("BUNDLE:" + b.getId())).findFirst().orElse(null);
    }

    private List<FeaturedItemDto> buildRandomPool(List<Game> games, List<Bundle> bundles) {
        List<FeaturedItemDto> pool = new ArrayList<>();
        for (Game g : games) pool.add(toGameDto(g));
        for (Bundle b : bundles) pool.add(toBundleDto(b));
        Collections.shuffle(pool);
        return pool;
    }

    private FeaturedItemDto firstUnusedFromPool(List<FeaturedItemDto> pool, Set<String> used) {
        return pool.stream()
                .filter(item -> !used.contains(item.getType() + ":" + item.getId()))
                .findFirst()
                .orElse(null);
    }

    private void fillFromPool(List<FeaturedItemDto> support, Set<String> used, List<FeaturedItemDto> pool, int max) {
        for (FeaturedItemDto item : pool) {
            if (support.size() >= max) break;
            String key = item.getType() + ":" + item.getId();
            if (!used.contains(key)) {
                support.add(item);
                used.add(key);
            }
        }
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
                .platforms(game.getSystemRequirements() != null ? new java.util.ArrayList<>(game.getSystemRequirements().keySet()) : List.of())
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
