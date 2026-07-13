package com.hand2font.repository;

import com.hand2font.model.Font;
import com.hand2font.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FontRepository extends JpaRepository<Font, Long> {

    // מיון לפי הבעלים - מהחדש לישן
    List<Font> findByOwnerOrderByIdDesc(User owner);

    @Query("SELECT DISTINCT f FROM Font f " +
            "LEFT JOIN PermissionedPeople pp ON f.id = pp.font.id " +
            "WHERE f.owner.id = :userId " +
            "OR LOWER(pp.email) = LOWER(:email) " +
            "OR f.permission = 'PUBLIC' " +
            "ORDER BY f.id DESC") // הוספנו מיון מהחדש לישן
    List<Font> findAllAllowedFonts(@Param("userId") Long userId, @Param("email") String email);

    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Font f " +
            "LEFT JOIN PermissionedPeople pp ON f.id = pp.font.id " +
            "WHERE f.id = :fontId AND (" +
            "   f.permission = 'public' " +
            "   OR f.owner.id = :userId " +
            "   OR (f.permission = 'restricted' AND pp.email = :userEmail)" +
            ")")
    boolean hasPermission(@Param("fontId") Long fontId,
                          @Param("userId") Long userId,
                          @Param("userEmail") String userEmail);
}