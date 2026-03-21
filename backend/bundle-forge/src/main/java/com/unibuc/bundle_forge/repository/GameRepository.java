package com.unibuc.bundle_forge.repository;

import com.unibuc.bundle_forge.model.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, Integer> {

    List<Game> getGamesByDeveloperId(Integer id);

    List<Game> getGamesByPublisherId(Integer id);

}
