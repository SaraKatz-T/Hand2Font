package com.hand2font.repository;

import com.hand2font.model.ContentStyle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContentStyleRepository extends JpaRepository<ContentStyle, Long> {
}