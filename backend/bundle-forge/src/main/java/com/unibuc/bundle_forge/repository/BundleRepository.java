package com.unibuc.bundle_forge.repository;

import com.unibuc.bundle_forge.model.Bundle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BundleRepository extends JpaRepository<Bundle, Integer> {
}
