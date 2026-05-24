package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.GameCreateDto;
import com.unibuc.bundle_forge.dto.GameResponseDto;
import com.unibuc.bundle_forge.dto.GameUpdateDto;
import com.unibuc.bundle_forge.exception.ForbiddenException;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.mapper.GameMapper;
import com.unibuc.bundle_forge.model.*;
import com.unibuc.bundle_forge.repository.GameKeyRepository;
import com.unibuc.bundle_forge.repository.GameRepository;
import com.unibuc.bundle_forge.utils.EnumUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final GameKeyRepository gameKeyRepository;
    private final JwtService jwtService;
    private final GameMapper gameMapper;
    private final ImageService imageService;
    private final TagService tagService;

    public Game getGame(Integer gameId) {
        return gameRepository.findById(gameId).orElseThrow(
                () -> new NotFoundException(String.format("Game with id %d not found", gameId))
        );
    }

    private GameResponseDto toResponseDtoWithKeyCount(Game game) {
        GameResponseDto dto = gameMapper.toResponseDto(game);
        dto.setActiveKeyCount(gameKeyRepository.countByGameIdAndStatus(game.getId(), GameKey.Status.ACTIVE));
        return dto;
    }

    public GameResponseDto getGameDetails(Integer gameId) {
        return toResponseDtoWithKeyCount(getGame(gameId));
    }

    public List<GameResponseDto> getAllGamesOfCurrentProvider(String status, String title) {
        Game.Status statusObj = EnumUtils.fromString(Game.Status.class, status);
        String normalizedTitle = (title == null) ? "" : title.toLowerCase().trim();

        Developer developer = (Developer) jwtService.getCurrentProvider();
        assert developer != null;

        return gameRepository.getGamesByDeveloperId(developer.getId())
                .stream()
                .filter(g -> statusObj == null || g.getStatus().equals(statusObj))
                .filter(g -> g.getTitle().toLowerCase().contains(normalizedTitle))
                .map(this::toResponseDtoWithKeyCount)
                .toList();
    }

    public GameResponseDto announceGame(GameCreateDto gameCreateDto, MultipartFile coverFile, List<MultipartFile> imagesFiles) {
        if (gameRepository.findByTitle(gameCreateDto.getTitle()).isPresent()) {
            throw new ValidationException("A game with this title already exists");
        }

        Game game = gameMapper.toEntity(gameCreateDto);
        String cover = imageService.uploadImage(coverFile);
        List<String> images = imageService.uploadImages(imagesFiles);

        game.setCover(cover);
        game.setImages(images);
        game.setDeveloper((Developer) jwtService.getCurrentProvider());
        game.setTags(tagService.getTagsByIds(gameCreateDto.getTagIds()));
        return toResponseDtoWithKeyCount(gameRepository.save(game));
    }

    @Transactional
    public GameResponseDto updateGame(Integer gameId, GameUpdateDto gameUpdateDto, MultipartFile coverFile, List<MultipartFile> imagesFiles) {
        Game game = getGame(gameId);
        Developer owner = game.getDeveloper();
        if (!owner.equals(jwtService.getCurrentProvider())) {
            throw new ForbiddenException("Not enough permissions");
        }

        if (gameUpdateDto.getTitle() != null && !gameUpdateDto.getTitle().isBlank()) {
            gameRepository.findByTitle(gameUpdateDto.getTitle())
                    .filter(g -> !g.getId().equals(gameId))
                    .ifPresent(g -> { throw new ValidationException("A game with this title already exists"); });
        }

        if (coverFile != null && !coverFile.isEmpty()) {
            imageService.deleteImage(game.getCover());
            game.setCover(imageService.uploadImage(coverFile));
        }

        List<String> existingToKeep = gameUpdateDto.getExistingImages() != null
                ? new ArrayList<>(gameUpdateDto.getExistingImages())
                : new ArrayList<>();
        if (game.getImages() != null) {
            game.getImages().stream()
                    .filter(img -> !existingToKeep.contains(img))
                    .forEach(imageService::deleteImage);
        }
        List<String> updatedImages = new ArrayList<>(existingToKeep);
        if (imagesFiles != null && !imagesFiles.isEmpty()) {
            updatedImages.addAll(imageService.uploadImages(imagesFiles));
        }
        game.setImages(updatedImages);

        if (gameUpdateDto.getTagIds() != null) {
            game.setTags(tagService.getTagsByIds(gameUpdateDto.getTagIds()));
        }

        EnumUtils.updateStatus(gameUpdateDto.getStatus(), game, Game.Status.class);

        gameMapper.updateEntityFromDto(gameUpdateDto, game);
        return toResponseDtoWithKeyCount(gameRepository.save(game));
    }

    public void deleteGame(Integer gameId) {
        Game game = getGame(gameId);
        if (!game.getDeveloper().equals(jwtService.getCurrentProvider())) {
            throw new ForbiddenException("Not enough permissions");
        }
        gameRepository.delete(game);
    }

}
