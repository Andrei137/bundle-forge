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
import com.unibuc.bundle_forge.utils.TestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContractServiceTest {

    @Mock private ContractRepository contractRepository;
    @Mock private GameRepository gameRepository;
    @Mock private JwtService jwtService;
    @Mock private ContractMapper contractMapper;
    @Mock private GameService gameService;

    @InjectMocks
    private ContractService contractService;

    private Developer developer;
    private Publisher publisher;
    private Game game;

    @BeforeEach
    void setUp() {
        developer = TestUtils.newDeveloper(1, "d@test.com", Provider.Status.ACCEPTED);
        publisher = TestUtils.newPublisher(2, "p@test.com", Provider.Status.ACCEPTED);
        game = Game.builder()
                .id(10).title("G").price(20.0).status(Game.Status.ANNOUNCED).salesCount(0)
                .developer(developer).build();
    }

    @Test
    void getAllContracts_asDeveloper_aggregatesContractsForOwnedGames() {
        when(jwtService.getCurrentProvider()).thenReturn(developer);
        when(gameRepository.getGamesByDeveloperId(developer.getId())).thenReturn(List.of(game));
        Contract c = Contract.builder().build();
        when(contractRepository.getContractsByGameId(10)).thenReturn(List.of(c));

        assertThat(contractService.getAllContracts()).containsExactly(c);
    }

    @Test
    void getAllContracts_asPublisher_returnsByPublisherId() {
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        Contract c = Contract.builder().build();
        when(contractRepository.getContractsByPublisherId(publisher.getId())).thenReturn(List.of(c));

        assertThat(contractService.getAllContracts()).containsExactly(c);
    }

    @Test
    void issueContract_creates() {
        ContractDto dto = ContractDto.builder().cutPercentage(40).build();
        Contract entity = Contract.builder().status(Contract.Status.PENDING).build();

        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractMapper.toEntity(dto)).thenReturn(entity);
        when(gameService.getGame(10)).thenReturn(game);
        when(contractRepository.getContractsByGameId(10)).thenReturn(List.of());
        when(contractRepository.save(any(Contract.class))).thenAnswer(inv -> inv.getArgument(0));

        Contract saved = contractService.issueContract(dto, 10);

        assertThat(saved.getPublisher()).isSameAs(publisher);
        assertThat(saved.getGame()).isSameAs(game);
    }

    @Test
    void issueContract_publishedGame_throws() {
        ContractDto dto = ContractDto.builder().cutPercentage(40).build();
        game.setStatus(Game.Status.PUBLISHED);
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractMapper.toEntity(dto)).thenReturn(Contract.builder().build());
        when(gameService.getGame(10)).thenReturn(game);

        assertThatThrownBy(() -> contractService.issueContract(dto, 10))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already published");
    }

    @Test
    void issueContract_existingAcceptedContract_throws() {
        ContractDto dto = ContractDto.builder().cutPercentage(40).build();
        Contract accepted = Contract.builder().status(Contract.Status.ACCEPTED).build();

        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractMapper.toEntity(dto)).thenReturn(Contract.builder().build());
        when(gameService.getGame(10)).thenReturn(game);
        when(contractRepository.getContractsByGameId(10)).thenReturn(List.of(accepted));

        assertThatThrownBy(() -> contractService.issueContract(dto, 10))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("under contract");
    }

    @Test
    void updateContract_updatesPending() {
        ContractDto dto = ContractDto.builder().cutPercentage(50).build();
        Contract pending = Contract.builder().status(Contract.Status.PENDING).cutPercentage(30).build();

        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractRepository.getContractByPublisherIdAndGameId(publisher.getId(), 10)).thenReturn(pending);
        when(contractRepository.save(pending)).thenReturn(pending);

        contractService.updateContract(dto, 10);

        verify(contractMapper).updateEntityFromDto(dto, pending);
        verify(contractRepository).save(pending);
    }

    @Test
    void updateContract_missing_throws() {
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractRepository.getContractByPublisherIdAndGameId(publisher.getId(), 10)).thenReturn(null);

        assertThatThrownBy(() -> contractService.updateContract(ContractDto.builder().build(), 10))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void updateContract_nonPending_throws() {
        Contract accepted = Contract.builder().status(Contract.Status.ACCEPTED).build();
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractRepository.getContractByPublisherIdAndGameId(publisher.getId(), 10)).thenReturn(accepted);

        assertThatThrownBy(() -> contractService.updateContract(ContractDto.builder().build(), 10))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void deleteContract_pending_deletes() {
        Contract pending = Contract.builder().status(Contract.Status.PENDING).build();
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractRepository.getContractByPublisherIdAndGameId(publisher.getId(), 10)).thenReturn(pending);

        contractService.deleteContract(10);

        verify(contractRepository).delete(pending);
    }

    @Test
    void deleteContract_missing_throws() {
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractRepository.getContractByPublisherIdAndGameId(publisher.getId(), 10)).thenReturn(null);

        assertThatThrownBy(() -> contractService.deleteContract(10))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void deleteContract_accepted_throws() {
        Contract accepted = Contract.builder().status(Contract.Status.ACCEPTED).build();
        when(jwtService.getCurrentProvider()).thenReturn(publisher);
        when(contractRepository.getContractByPublisherIdAndGameId(publisher.getId(), 10)).thenReturn(accepted);

        assertThatThrownBy(() -> contractService.deleteContract(10))
                .isInstanceOf(ForbiddenException.class);
    }
}
