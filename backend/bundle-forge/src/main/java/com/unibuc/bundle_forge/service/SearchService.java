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
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final GameRepository gameRepository;
    private final BundleRepository bundleRepository;

    public SearchPageDto search(String q, String type, List<Integer> tagIds, String developer,
                                int page, int size, String sort) {
        String title = (q == null || q.isBlank()) ? null : q.trim();
        String dev   = (developer == null || developer.isBlank()) ? null : developer.trim();
        List<Integer> tags = (tagIds == null || tagIds.isEmpty()) ? null : tagIds;

        if ("GAME".equalsIgnoreCase(type)) {
            return searchGames(title, dev, tags, page, size, sort);
        }
        if ("BUNDLE".equalsIgnoreCase(type)) {
            return searchBundles(title, page, size);
        }
        return searchBoth(title, dev, tags, page, size, sort);
    }

    private SearchPageDto searchGames(String title, String developer, List<Integer> tagIds,
                                       int page, int size, String sort) {
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
                                      int page, int size, String sort) {
        List<Game> games = gameRepository.findAllMatching(Game.Status.PUBLISHED, title, developer, tagIds);
        List<Bundle> bundles = bundleRepository.findAllMatching(title);

        List<SearchItemDto> all = new ArrayList<>();
        all.addAll(games.stream().map(this::toGameDto).toList());
        all.addAll(bundles.stream().map(this::toBundleDto).toList());

        long totalElements = all.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int start = page * size;
        int end = (int) Math.min((long) start + size, totalElements);
        List<SearchItemDto> pageContent = (start < all.size()) ? all.subList(start, end) : List.of();

        return SearchPageDto.builder()
                .content(pageContent)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .build();
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

    private Sort resolveSort(String sort) {
        if (sort == null) return Sort.by("releaseDate").descending();
        return switch (sort) {
            case "price_asc"  -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "title"      -> Sort.by("title").ascending();
            default           -> Sort.by("releaseDate").descending();
        };
    }

}
