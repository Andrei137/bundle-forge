package com.unibuc.bundle_forge.repository;

import com.unibuc.bundle_forge.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Integer> {

    List<Contract> getContractsByPublisherId(Integer developerId);

    List<Contract> getContractsByGameId(Integer gameId);

    Contract getContractByPublisherIdAndGameId(Integer publisherId, Integer gameId);

    Contract getContractByGameIdAndStatus(Integer gameId, Contract.Status status);

}
