package com.hand2font.repository;

import com.hand2font.model.ExpressionStyle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExpressionStyleRepository extends JpaRepository<ExpressionStyle, Long> {
    Optional<ExpressionStyle> findByName(String name);
}