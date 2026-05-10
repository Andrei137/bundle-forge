package com.unibuc.bundle_forge.repository;

import com.unibuc.bundle_forge.model.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Integer> {

    List<Game> findByStatus(Game.Status status);

    List<Game> getGamesByDeveloperId(Integer id);

    List<Game> getGamesByPublisherId(Integer id);

    Optional<Game> findByTitle(String title);

    @Query("SELECT g FROM Game g " +
           "WHERE g.status = :status " +
           "AND (:title IS NULL OR LOWER(g.title) LIKE LOWER(CONCAT('%', :title, '%'))) " +
           "AND (:developer IS NULL OR LOWER(g.developer.displayName) LIKE LOWER(CONCAT('%', :developer, '%'))) " +
           "AND (:tagIds IS NULL OR EXISTS (" +
           "  SELECT t FROM g.tags t WHERE t.id IN :tagIds" +
           "))")
    Page<Game> search(
            @Param("status") Game.Status status,
            @Param("title") String title,
            @Param("developer") String developer,
            @Param("tagIds") List<Integer> tagIds,
            Pageable pageable
    );

    @Query("SELECT g FROM Game g " +
           "WHERE g.status = :status " +
           "AND (:title IS NULL OR LOWER(g.title) LIKE LOWER(CONCAT('%', :title, '%'))) " +
           "AND (:developer IS NULL OR LOWER(g.developer.displayName) LIKE LOWER(CONCAT('%', :developer, '%'))) " +
           "AND (:tagIds IS NULL OR EXISTS (" +
           "  SELECT t FROM g.tags t WHERE t.id IN :tagIds" +
           "))")
    List<Game> findAllMatching(
            @Param("status") Game.Status status,
            @Param("title") String title,
            @Param("developer") String developer,
            @Param("tagIds") List<Integer> tagIds
    );

}
