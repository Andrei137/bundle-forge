package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.GameKeyUploadResponseDto;
import com.unibuc.bundle_forge.exception.ForbiddenException;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.model.GameKey;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.repository.GameKeyRepository;
import com.unibuc.bundle_forge.repository.GameRepository;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameKeyServiceTest {

    @Mock private GameKeyRepository gameKeyRepository;
    @Mock private GameRepository gameRepository;
    @Mock private JwtService jwtService;

    @InjectMocks
    private GameKeyService gameKeyService;

    private Developer developer;
    private Game game;

    @BeforeEach
    void setUp() {
        developer = TestUtils.newDeveloper(1, "d@test.com", Provider.Status.ACCEPTED);
        game = Game.builder().id(10).title("G").price(10.0).developer(developer).status(Game.Status.PUBLISHED).build();
    }

    @Test
    void getActiveKeyCount_delegatesToRepo() {
        when(gameKeyRepository.countByGameIdAndStatus(10, GameKey.Status.ACTIVE)).thenReturn(7L);
        assertThat(gameKeyService.getActiveKeyCount(10)).isEqualTo(7L);
    }

    @Test
    void uploadKeys_gameMissing_throws() {
        when(gameRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> gameKeyService.uploadKeys(99, List.of()))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void uploadKeys_notOwner_throws() {
        Developer someoneElse = TestUtils.newDeveloper(42, "x@test.com", Provider.Status.ACCEPTED);
        when(gameRepository.findById(10)).thenReturn(Optional.of(game));
        when(jwtService.getCurrentProvider()).thenReturn(someoneElse);

        assertThatThrownBy(() -> gameKeyService.uploadKeys(10, List.of()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void uploadKeys_classifiesValidInvalidDuplicateAndExisting() {
        when(gameRepository.findById(10)).thenReturn(Optional.of(game));
        when(jwtService.getCurrentProvider()).thenReturn(developer);

        String valid1 = "ABCDE-12345-FGHIJ";
        String valid2 = "ZZZZZ-99999-AAAAA";
        String invalid = "not-valid";
        String existing = "EXIST-AAAAA-BBBBB";

        when(gameKeyRepository.findAllByIdIn(anyList()))
                .thenReturn(List.of(GameKey.builder().id(existing).status(GameKey.Status.ACTIVE).build()));
        when(gameKeyRepository.countByGameIdAndStatus(10, GameKey.Status.ACTIVE)).thenReturn(5L);

        GameKeyUploadResponseDto result = gameKeyService.uploadKeys(10,
                List.of(valid1, valid2, invalid, valid1, existing));

        assertThat(result.getInvalidFormat()).containsExactly(invalid);
        assertThat(result.getDuplicatesInFile()).containsExactly(valid1);
        assertThat(result.getAlreadyExisting()).isEqualTo(1);
        assertThat(result.getAdded()).isEqualTo(2); // valid1 and valid2; existing is filtered
        assertThat(result.getTotalActiveKeys()).isEqualTo(5L);

        ArgumentCaptor<List<GameKey>> captor = ArgumentCaptor.forClass(List.class);
        verify(gameKeyRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).extracting(GameKey::getId)
                .containsExactlyInAnyOrder(valid1, valid2);
    }
}
