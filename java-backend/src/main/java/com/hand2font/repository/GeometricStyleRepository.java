package com.hand2font.repository;

import com.hand2font.model.GeometricStyle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GeometricStyleRepository extends JpaRepository<GeometricStyle, Long> {
    Optional<GeometricStyle> findByName(String name);
}