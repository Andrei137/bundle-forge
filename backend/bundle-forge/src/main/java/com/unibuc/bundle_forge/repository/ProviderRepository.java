package com.unibuc.bundle_forge.repository;

import com.unibuc.bundle_forge.model.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderRepository<T extends Provider> extends JpaRepository<T, Integer> {

    List<T> findByStatus(Provider.Status status);
    Optional<T> findByIdAndStatus(Integer id, Provider.Status status);
    Optional<T> findByDisplayName(String displayName);

}
