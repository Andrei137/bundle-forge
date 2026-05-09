package com.unibuc.bundle_forge.repository;

import com.unibuc.bundle_forge.model.GameKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameKeyRepository extends JpaRepository<GameKey, String> {
    long countByGameIdAndStatus(Integer gameId, GameKey.Status status);
    List<GameKey> findAllByIdIn(List<String> ids);
}
