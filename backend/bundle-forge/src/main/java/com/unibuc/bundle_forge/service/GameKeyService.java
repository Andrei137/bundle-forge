package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.GameKeyUploadResponseDto;
import com.unibuc.bundle_forge.exception.ForbiddenException;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.model.GameKey;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.repository.GameKeyRepository;
import com.unibuc.bundle_forge.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class GameKeyService {

    private static final Pattern KEY_PATTERN = Pattern.compile("^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$");

    private final GameKeyRepository gameKeyRepository;
    private final GameRepository gameRepository;
    private final JwtService jwtService;

    public long getActiveKeyCount(Integer gameId) {
        return gameKeyRepository.countByGameIdAndStatus(gameId, GameKey.Status.ACTIVE);
    }

    public GameKeyUploadResponseDto uploadKeys(Integer gameId, List<String> keys) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new NotFoundException(String.format("Game with id %d not found", gameId)));
        Provider provider = jwtService.getCurrentProvider();
        if (!game.getDeveloper().getId().equals(provider.getId())) {
            throw new ForbiddenException("Not enough permissions");
        }

        List<String> invalidFormat = new ArrayList<>();
        List<String> duplicatesInFile = new ArrayList<>();
        LinkedHashSet<String> seen = new LinkedHashSet<>();

        for (String key : keys) {
            String normalized = key.toUpperCase().trim();
            if (!KEY_PATTERN.matcher(normalized).matches()) {
                invalidFormat.add(key);
                continue;
            }
            if (!seen.add(normalized)) {
                duplicatesInFile.add(normalized);
            }
        }

        List<String> uniqueValid = new ArrayList<>(seen);
        List<String> alreadyExistingIds = gameKeyRepository.findAllByIdIn(uniqueValid)
                .stream().map(GameKey::getId).toList();

        List<GameKey> toSave = uniqueValid.stream()
                .filter(k -> !alreadyExistingIds.contains(k))
                .map(k -> GameKey.builder().id(k).game(game).status(GameKey.Status.ACTIVE).build())
                .toList();

        gameKeyRepository.saveAll(toSave);

        long totalActive = gameKeyRepository.countByGameIdAndStatus(gameId, GameKey.Status.ACTIVE);
        return new GameKeyUploadResponseDto(toSave.size(), alreadyExistingIds.size(), duplicatesInFile, invalidFormat, totalActive);
    }
}
