package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.ContractDto;
import com.unibuc.bundle_forge.dto.GameCreateDto;
import com.unibuc.bundle_forge.dto.GameResponseDto;
import com.unibuc.bundle_forge.dto.GameUpdateDto;
import com.unibuc.bundle_forge.exception.ForbiddenException;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.mapper.GameMapper;
import com.unibuc.bundle_forge.model.*;
import com.unibuc.bundle_forge.repository.ContractRepository;
import com.unibuc.bundle_forge.repository.GameRepository;
import com.unibuc.bundle_forge.utils.EnumUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final ContractRepository contractRepository;
    private final JwtService jwtService;
    private final GameMapper gameMapper;
    private final ImageService imageService;
    private final TagService tagService;

    public Game getGame(Integer gameId) {
        return gameRepository.findById(gameId).orElseThrow(
                () -> new NotFoundException(String.format("Game with id %d not found", gameId))
        );
    }

    public GameResponseDto getGameDetails(Integer gameId) {
        return gameMapper.toResponseDto(getGame(gameId));
    }

    private Provider getGameOwner(Game game) {
        Provider owner = game.getPublisher();
        if (owner != null) return owner;
        return game.getDeveloper();
    }

    public List<GameResponseDto> getAllGamesOfCurrentProvider(String status, String title) {
        Game.Status statusObj = EnumUtils.fromString(Game.Status.class, status);
        String normalizedTitle = (title == null) ? "" : title.toLowerCase().trim();

        Stream<Game> gamesStream;
        Provider provider = jwtService.getCurrentProvider();
        assert provider != null;
        if (provider instanceof Developer) {
            gamesStream = gameRepository.getGamesByDeveloperId(provider.getId()).stream();
        } else {
            gamesStream = gameRepository.getGamesByPublisherId(provider.getId()).stream();
        }

        return gamesStream
                .filter(g -> statusObj == null || g.getStatus().equals(statusObj))
                .filter(g -> g.getTitle().toLowerCase().contains(normalizedTitle))
                .map(gameMapper::toResponseDto)
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
        return gameMapper.toResponseDto(gameRepository.save(game));
    }

    @Transactional
    public GameResponseDto updateGame(Integer gameId, GameUpdateDto gameUpdateDto, MultipartFile coverFile, List<MultipartFile> imagesFiles) {
        Game game = getGame(gameId);
        Provider owner = getGameOwner(game);
        if (!owner.equals(jwtService.getCurrentProvider())) {
            throw new ForbiddenException("Not enough permissions");
        }
        if (owner instanceof Developer) {
            Contract contract = contractRepository.getContractByGameIdAndStatus(gameId, Contract.Status.ACCEPTED);
            if (contract != null && !game.getStatus().equals(Game.Status.ANNOUNCED)) {
                throw new ForbiddenException("Cannot update the game anymore, you are under contract");
            }
        } else if (game.getStatus().equals(Game.Status.ANNOUNCED)) {
            throw new ForbiddenException("Game is not developed yet");
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

        EnumUtils.updateStatus(
                gameUpdateDto.getStatus(),
                game,
                Game.Status.class
        );
        if (game.getStatus().equals(Game.Status.PUBLISHED)) {
            game.setPublisher(jwtService.getCurrentProvider());
        }

        gameMapper.updateEntityFromDto(gameUpdateDto, game);
        return gameMapper.toResponseDto(gameRepository.save(game));
    }

    public List<Contract> getGameContracts(Integer gameId) {
        Game game = getGame(gameId);
        Provider provider = jwtService.getCurrentProvider();
        if (!game.getDeveloper().getId().equals(provider.getId())) {
            throw new ForbiddenException("Not enough permissions");
        }

        return game.getContracts();
    }

    public Contract updateContractStatus(Integer gameId, Integer publisherId, ContractDto contractDto) {
        Game game = getGame(gameId);
        Provider provider = jwtService.getCurrentProvider();
        if (!game.getDeveloper().getId().equals(provider.getId())) {
            throw new ForbiddenException("Not enough permissions");
        }

        Contract contract = contractRepository.getContractByPublisherIdAndGameId(publisherId, gameId);
        if (contract == null) {
            throw new NotFoundException(String.format("No contract found for game id %d and publisher id %d", gameId, publisherId));
        }

        EnumUtils.updateStatus(
                contractDto.getStatus(),
                contract,
                Contract.Status.class
        );

        return contractRepository.save(contract);
    }

    public void deleteGame(Integer gameId) {
        Game game = getGame(gameId);
        Provider owner = getGameOwner(game);
        if (!owner.equals(jwtService.getCurrentProvider())) {
            throw new ForbiddenException("Not enough permissions");
        }

        gameRepository.delete(game);
    }

}
