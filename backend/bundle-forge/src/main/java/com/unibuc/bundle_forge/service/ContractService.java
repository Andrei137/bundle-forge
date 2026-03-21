package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.ContractDto;
import com.unibuc.bundle_forge.exception.ForbiddenException;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.mapper.ContractMapper;
import com.unibuc.bundle_forge.model.Contract;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.model.Provider;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.repository.ContractRepository;
import com.unibuc.bundle_forge.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public final class ContractService {

    private final ContractRepository contractRepository;
    private final GameRepository gameRepository;
    private final JwtService jwtService;
    private final ContractMapper contractMapper;
    private final GameService gameService;

    public List<Contract> getAllContracts() {
        Provider currentProvider = jwtService.getCurrentProvider();
        assert currentProvider != null;

        if (currentProvider instanceof Developer) {
            List<Game> developedGames = gameRepository.getGamesByDeveloperId(currentProvider.getId());
            return developedGames.stream()
                    .flatMap(game -> contractRepository
                            .getContractsByGameId(game.getId())
                            .stream())
                    .toList();
        } else {
            return contractRepository.getContractsByPublisherId(currentProvider.getId());
        }
    }

    public Contract issueContract(ContractDto contractDto, Integer gameId) {
        Provider currentProvider = jwtService.getCurrentProvider();
        assert currentProvider instanceof Publisher;

        Contract contract = contractMapper.toEntity(contractDto);
        contract.setPublisher((Publisher) currentProvider);

        Game game = gameService.getGame(gameId);
        if (game.getStatus() == Game.Status.PUBLISHED || game.getStatus() == Game.Status.DELISTED) {
            throw new ValidationException(String.format("Game at id %s already published", gameId));
        }
        contract.setGame(game);

        List<Contract> otherContracts = contractRepository.getContractsByGameId(gameId);
        if (otherContracts
                .stream()
                .anyMatch(c -> c.getStatus() == Contract.Status.ACCEPTED)
        ) {
            throw new ValidationException(
                    String.format("Game at id %s already under contract", gameId)
            );
        }

        return contractRepository.save(contract);
    }

    public Contract updateContract(ContractDto contractDto, Integer gameId) {
        Provider currentProvider = jwtService.getCurrentProvider();
        assert currentProvider instanceof Publisher;

        Contract contract = contractRepository.getContractByPublisherIdAndGameId(currentProvider.getId(), gameId);
        if (contract == null) {
            throw new ValidationException(String.format("Contract not found with game %s", gameId));
        }
        if (contract.getStatus() != Contract.Status.PENDING) {
            throw new ForbiddenException("Contract no longer pending, no changes allowed");
        }
        contractMapper.updateEntityFromDto(contractDto, contract);
        return contractRepository.save(contract);
    }

    public void deleteContract(Integer gameId) {
        Provider currentProvider = jwtService.getCurrentProvider();
        assert currentProvider instanceof Publisher;

        Contract contract = contractRepository.getContractByPublisherIdAndGameId(currentProvider.getId(), gameId);
        if (contract == null) {
            throw new NotFoundException(String.format("Contract not found with game %s", gameId));
        }
        if (contract.getStatus() == Contract.Status.ACCEPTED) {
            throw new ForbiddenException("Cannot delete accepted contract");
        }
        contractRepository.delete(contract);
    }

}
