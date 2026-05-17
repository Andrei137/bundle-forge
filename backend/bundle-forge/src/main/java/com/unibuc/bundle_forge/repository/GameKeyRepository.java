package com.unibuc.bundle_forge.repository;

import com.unibuc.bundle_forge.model.GameKey;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GameKeyRepository extends JpaRepository<GameKey, String> {
    long countByGameIdAndStatus(Integer gameId, GameKey.Status status);
    List<GameKey> findAllByIdIn(List<String> ids);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select k from GameKey k where k.game.id = :gameId and k.status = com.unibuc.bundle_forge.model.GameKey$Status.ACTIVE order by k.id asc")
    List<GameKey> lockActiveKeysByGameId(@Param("gameId") Integer gameId);

    default Optional<GameKey> lockNextActiveKey(Integer gameId) {
        List<GameKey> keys = lockActiveKeysByGameId(gameId);
        return keys.isEmpty() ? Optional.empty() : Optional.of(keys.get(0));
    }
}
