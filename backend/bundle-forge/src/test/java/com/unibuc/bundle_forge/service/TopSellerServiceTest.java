package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.FeaturedItemDto;
import com.unibuc.bundle_forge.model.Bundle;
import com.unibuc.bundle_forge.model.BundleTier;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.repository.BundleRepository;
import com.unibuc.bundle_forge.repository.GameRepository;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TopSellerServiceTest {

    @Mock private GameRepository gameRepository;
    @Mock private BundleRepository bundleRepository;

    @InjectMocks
    private TopSellerService topSellerService;

    private Game game(int id, int sales, int discount) {
        Developer dev = TestUtils.newDeveloper(1, "d@test.com", Provider.Status.ACCEPTED);
        return Game.builder()
                .id(id).title("g" + id).price(10.0).cover("c.png")
                .status(Game.Status.PUBLISHED)
                .salesCount(sales).discountPercentage(discount)
                .developer(dev).build();
    }

    private Bundle bundle(int id, int sales) {
        return Bundle.builder()
                .id(id).title("b" + id).cover("c.png").salesCount(sales)
                .tiers(List.of(BundleTier.builder().numRequiredGames(2).pricePerGame(5.0).build()))
                .build();
    }

    @Test
    void gamesOnly_sortedBySalesThenDiscount() {
        when(gameRepository.findByStatus(Game.Status.PUBLISHED))
                .thenReturn(List.of(game(1, 10, 5), game(2, 30, 0), game(3, 30, 10)));

        List<FeaturedItemDto> result = topSellerService.getTopSellers("GAMES");

        assertThat(result).extracting(FeaturedItemDto::getId).containsExactly(3, 2, 1);
        assertThat(result).extracting(FeaturedItemDto::getType).allMatch("GAME"::equals);
    }

    @Test
    void bundlesOnly_returnsBundles() {
        when(bundleRepository.findAll()).thenReturn(List.of(bundle(1, 5), bundle(2, 50)));

        List<FeaturedItemDto> result = topSellerService.getTopSellers("BUNDLES");

        assertThat(result).extracting(FeaturedItemDto::getId).containsExactly(2, 1);
        assertThat(result).extracting(FeaturedItemDto::getType).allMatch("BUNDLE"::equals);
        assertThat(result.get(0).getPrice()).isEqualTo(10.0);
    }

    @Test
    void mixed_returnsBothSorted() {
        when(gameRepository.findByStatus(Game.Status.PUBLISHED))
                .thenReturn(List.of(game(1, 20, 0)));
        when(bundleRepository.findAll()).thenReturn(List.of(bundle(100, 50)));

        List<FeaturedItemDto> result = topSellerService.getTopSellers(null);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getType()).isEqualTo("BUNDLE");
        assertThat(result.get(1).getType()).isEqualTo("GAME");
    }

    @Test
    void limitsTo12() {
        when(gameRepository.findByStatus(Game.Status.PUBLISHED))
                .thenReturn(IntStream.range(0, 20).mapToObj(i -> game(i, 100 - i, 0)).toList());
        when(bundleRepository.findAll()).thenReturn(List.of());

        List<FeaturedItemDto> result = topSellerService.getTopSellers("ALL");

        assertThat(result).hasSize(12);
    }
}
