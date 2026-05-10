package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.SearchItemDto;
import com.unibuc.bundle_forge.dto.SearchPageDto;
import com.unibuc.bundle_forge.model.Bundle;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.repository.BundleRepository;
import com.unibuc.bundle_forge.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final GameRepository gameRepository;
    private final BundleRepository bundleRepository;

    public SearchPageDto search(String q, String type, List<Integer> tagIds, String developer,
                                List<String> platforms, int page, int size, String sort) {
        String title = (q == null || q.isBlank()) ? null : q.trim();
        String dev   = (developer == null || developer.isBlank()) ? null : developer.trim();
        List<Integer> tags = (tagIds == null || tagIds.isEmpty()) ? null : tagIds;
        List<String> plats = (platforms == null || platforms.isEmpty()) ? null : platforms;

        if ("GAME".equalsIgnoreCase(type)) {
            return searchGames(title, dev, tags, plats, page, size, sort);
        }
        if ("BUNDLE".equalsIgnoreCase(type)) {
            return searchBundles(title, page, size);
        }
        return searchBoth(title, dev, tags, plats, page, size, sort);
    }

    private SearchPageDto searchGames(String title, String developer, List<Integer> tagIds,
                                       List<String> platforms, int page, int size, String sort) {
        boolean isPriceSort = "price_asc".equals(sort) || "price_desc".equals(sort);
        if (platforms != null || isPriceSort) {
            List<Game> all = gameRepository.findAllMatching(Game.Status.PUBLISHED, title, developer, tagIds);
            List<Game> sorted = sortGamesInMemory(all, sort);
            if (platforms != null) {
                sorted = sorted.stream().filter(g -> matchesPlatform(g, platforms)).toList();
            }
            return paginate(sorted.stream().map(this::toGameDto).toList(), page, size);
        }
        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));
        Page<Game> result = gameRepository.search(Game.Status.PUBLISHED, title, developer, tagIds, pageable);
        return SearchPageDto.builder()
                .content(result.getContent().stream().map(this::toGameDto).toList())
                .page(page)
                .size(size)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    private SearchPageDto searchBundles(String title, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("title").ascending());
        Page<Bundle> result = bundleRepository.search(title, pageable);
        return SearchPageDto.builder()
                .content(result.getContent().stream().map(this::toBundleDto).toList())
                .page(page)
                .size(size)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    private SearchPageDto searchBoth(String title, String developer, List<Integer> tagIds,
                                      List<String> platforms, int page, int size, String sort) {
        List<Game> games = gameRepository.findAllMatching(Game.Status.PUBLISHED, title, developer, tagIds);
        List<Bundle> bundles = bundleRepository.findAllMatching(title);
        if (platforms != null) {
            games = games.stream().filter(g -> matchesPlatform(g, platforms)).toList();
        }

        List<SearchItemDto> all = new ArrayList<>();
        all.addAll(games.stream().map(this::toGameDto).toList());
        all.addAll(bundles.stream().map(this::toBundleDto).toList());
        return paginate(sortDtos(all, sort), page, size);
    }

    private SearchItemDto toGameDto(Game game) {
        List<String> tagNames = game.getTags() != null
                ? game.getTags().stream().map(t -> t.getName()).toList()
                : List.of();
        List<String> platforms = game.getSystemRequirements() != null
                ? new ArrayList<>(game.getSystemRequirements().keySet())
                : List.of();
        String developerName = game.getDeveloper() != null
                ? game.getDeveloper().getDisplayName()
                : null;
        return SearchItemDto.builder()
                .id(game.getId())
                .type("GAME")
                .title(game.getTitle())
                .cover(game.getCover())
                .price(game.getPrice())
                .discountPercentage(game.getDiscountPercentage())
                .developer(developerName)
                .tags(tagNames)
                .platforms(platforms)
                .releaseDate(game.getReleaseDate())
                .build();
    }

    private SearchItemDto toBundleDto(Bundle bundle) {
        return SearchItemDto.builder()
                .id(bundle.getId())
                .type("BUNDLE")
                .title(bundle.getTitle())
                .cover(bundle.getCover())
                .build();
    }

    private List<Game> sortGamesInMemory(List<Game> games, String sort) {
        Comparator<Game> cmp = switch (sort != null ? sort : "") {
            case "price_asc"  -> Comparator.comparingDouble(
                    g -> effectivePrice(g.getPrice(), g.getDiscountPercentage()));
            case "price_desc" -> Comparator.<Game>comparingDouble(
                    g -> effectivePrice(g.getPrice(), g.getDiscountPercentage())).reversed();
            case "title"      -> Comparator.comparing(Game::getTitle,
                    Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            default           -> Comparator.comparing(Game::getReleaseDate,
                    Comparator.nullsLast(Comparator.reverseOrder()));
        };
        return games.stream().sorted(cmp).toList();
    }

    private List<SearchItemDto> sortDtos(List<SearchItemDto> items, String sort) {
        Comparator<SearchItemDto> cmp = switch (sort != null ? sort : "") {
            case "price_asc"  -> Comparator.comparingDouble(
                    i -> effectivePrice(i.getPrice(), i.getDiscountPercentage()));
            case "price_desc" -> Comparator.<SearchItemDto>comparingDouble(
                    i -> effectivePrice(i.getPrice(), i.getDiscountPercentage())).reversed();
            case "title"      -> Comparator.comparing(SearchItemDto::getTitle,
                    Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            default           -> Comparator.comparing(SearchItemDto::getReleaseDate,
                    Comparator.nullsLast(Comparator.reverseOrder()));
        };
        return items.stream().sorted(cmp).toList();
    }

    private double effectivePrice(Double price, Integer discountPercentage) {
        if (price == null) return Double.MAX_VALUE;
        int discount = discountPercentage != null ? discountPercentage : 0;
        return price * (1.0 - discount / 100.0);
    }

    private SearchPageDto paginate(List<SearchItemDto> all, int page, int size) {
        long totalElements = all.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int start = page * size;
        int end = (int) Math.min((long) start + size, totalElements);
        List<SearchItemDto> content = (start < all.size()) ? all.subList(start, end) : List.of();
        return SearchPageDto.builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .build();
    }

    private boolean matchesPlatform(Game game, List<String> platforms) {
        if (game.getSystemRequirements() == null || game.getSystemRequirements().isEmpty()) return false;
        return platforms.stream().anyMatch(p ->
                game.getSystemRequirements().keySet().stream()
                        .anyMatch(k -> k.equalsIgnoreCase(p))
        );
    }

    private Sort resolveSort(String sort) {
        if (sort == null) return Sort.by("releaseDate").descending();
        return switch (sort) {
            case "title" -> Sort.by("title").ascending();
            default      -> Sort.by("releaseDate").descending();
        };
    }

}
