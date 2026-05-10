package com.unibuc.bundle_forge.repository;

import com.unibuc.bundle_forge.model.Bundle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BundleRepository extends JpaRepository<Bundle, Integer> {

    @Query("SELECT b FROM Bundle b " +
           "WHERE (:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%')))")
    Page<Bundle> search(@Param("title") String title, Pageable pageable);

    @Query("SELECT b FROM Bundle b " +
           "WHERE (:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%')))")
    List<Bundle> findAllMatching(@Param("title") String title);

}
