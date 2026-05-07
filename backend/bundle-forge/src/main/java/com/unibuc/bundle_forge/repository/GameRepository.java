package com.unibuc.bundle_forge.repository;

import com.unibuc.bundle_forge.model.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Integer> {

    List<Game> getGamesByDeveloperId(Integer id);

    List<Game> getGamesByPublisherId(Integer id);

    Optional<Game> findByTitle(String title);

}
