package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.ContractDto;
import com.unibuc.bundle_forge.exception.ForbiddenException;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.mapper.ContractMapper;
import com.unibuc.bundle_forge.model.Contract;
import com.unibuc.bundle_forge.model.Developer;
import com.unibuc.bundle_forge.model.Game;
import com.unibuc.bundle_forge.model.Publisher;
import com.unibuc.bundle_forge.repository.ContractRepository;
import com.unibuc.bundle_forge.repository.GameRepository;
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ContractServiceTest {

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private GameRepository gameRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private ContractMapper contractMapper;
    
    @Mock
    private GameService gameService;

    @InjectMocks
    private ContractService contractService;

    private Publisher publisher;
    private Developer developer;
    private ContractDto contractDto;
    private Contract contract;
    private Game game;

    @BeforeEach
    void setUp() {
        publisher = TestUtils.publisher1;
        developer = TestUtils.developer1;
        game = TestUtils.game1;
        contractDto = new ContractDto();
        contract = new Contract();
    }

    @Test
    void getAllContracts_ForDeveloper_ShouldReturnContractsForDevelopedGames() {
        when(jwtService.getCurrentProvider()).thenReturn(developer);
        when(gameRepository.getGamesByDeveloperId(developer.getId())).thenReturn(List.of(game));
        when(contractRepository.getContractsByGameId(game.getId())).thenReturn(List.of(contract));

        List<Contract> result = contractService.getAllContracts();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(contract, result.getFirst());
    }

    @Test
    void getAllContracts_ForPublisher_ShouldReturnPublisherContracts() {
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractRepository.getContractsByPublisherId(publisher.getId())).thenReturn(List.of(contract));

        List<Contract> result = contractService.getAllContracts();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(contract, result.getFirst());
    }

    @Test
    void issueContract_Valid_ShouldSaveContract() {
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractMapper.toEntity(contractDto)).thenReturn(contract);
        when(gameService.getGame(game.getId())).thenReturn(game);
        when(contractRepository.getContractsByGameId(game.getId())).thenReturn(List.of());
        when(contractRepository.save(contract)).thenReturn(contract);

        Contract result = contractService.issueContract(contractDto, game.getId());

        assertNotNull(result);
        assertEquals(contract, result);
        assertEquals(publisher, result.getPublisher());
        assertEquals(game, result.getGame());
    }

    @Test
    void issueContract_GameAlreadyPublished_ShouldThrowValidationException() {
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractMapper.toEntity(contractDto)).thenReturn(contract);
        game.setStatus(Game.Status.PUBLISHED);
        when(gameService.getGame(game.getId())).thenReturn(game);

        assertThatThrownBy(() -> contractService.issueContract(contractDto, game.getId()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already published");
    }

    @Test
    void issueContract_GameAlreadyUnderAcceptedContract_ShouldThrowValidationException() {
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractMapper.toEntity(contractDto)).thenReturn(contract);
        game.setStatus(Game.Status.DEVELOPED);
        when(gameService.getGame(game.getId())).thenReturn(game);

        Contract other = Contract.builder().status(Contract.Status.ACCEPTED).build();
        when(contractRepository.getContractsByGameId(game.getId())).thenReturn(List.of(other));

        assertThatThrownBy(() -> contractService.issueContract(contractDto, game.getId()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already under contract");
    }

    @Test
    void updateContract_ValidPendingContract_ShouldSaveContract() {
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractRepository.getContractByPublisherIdAndGameId(publisher.getId(), game.getId()))
                .thenReturn(contract);
        when(contractRepository.save(contract)).thenReturn(contract);

        Contract result = contractService.updateContract(contractDto, game.getId());

        assertNotNull(result);

        verify(contractMapper, times(1)).updateEntityFromDto(contractDto, contract);
        verify(contractRepository, times(1)).save(contract);
    }

    @Test
    void updateContract_NonPendingContract_ShouldThrowForbiddenException() {
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        contract.setStatus(Contract.Status.ACCEPTED);
        when(contractRepository.getContractByPublisherIdAndGameId(publisher.getId(), game.getId()))
                .thenReturn(contract);

        assertThatThrownBy(() -> contractService.updateContract(contractDto, game.getId()))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("no longer pending");
    }

    @Test
    void updateContract_ContractNotFound_ShouldThrowValidationException() {
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractRepository.getContractByPublisherIdAndGameId(publisher.getId(), game.getId()))
                .thenReturn(null);

        assertThatThrownBy(() -> contractService.updateContract(contractDto, game.getId()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Contract not found");
    }

    @Test
    void deleteContract_ValidPendingContract_ShouldDeleteContract() {
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        contract.setStatus(Contract.Status.PENDING);
        when(contractRepository.getContractByPublisherIdAndGameId(publisher.getId(), game.getId()))
                .thenReturn(contract);

        contractService.deleteContract(game.getId());

        verify(contractRepository, times(1)).delete(contract);
    }

    @Test
    void deleteContract_ContractAccepted_ShouldThrowForbiddenException() {
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        contract.setStatus(Contract.Status.ACCEPTED);
        when(contractRepository.getContractByPublisherIdAndGameId(publisher.getId(), game.getId()))
                .thenReturn(contract);

        assertThatThrownBy(() -> contractService.deleteContract(game.getId()))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Cannot delete accepted contract");
    }

    @Test
    void deleteContract_ContractNotFound_ShouldThrowNotFoundException() {
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractRepository.getContractByPublisherIdAndGameId(publisher.getId(), game.getId()))
                .thenReturn(null);

        assertThatThrownBy(() -> contractService.deleteContract(game.getId()))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Contract not found");
    }
}
