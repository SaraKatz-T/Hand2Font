package com.hand2font.repository;

import com.hand2font.model.Font;
import com.hand2font.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FontRepository extends JpaRepository<Font, Long> {

    List<Font> findByOwner(User owner);

    @Query("SELECT DISTINCT f FROM Font f " +
            "LEFT JOIN PermissionedPeople pp ON f.id = pp.font.id " +
            "WHERE " +
            "   f.permission = 'public' " +
            "   OR f.owner.id = :userId " +
            "   OR (f.permission = 'restricted' AND pp.user.id = :userId)")
    List<Font> findAllAllowedFonts(@Param("userId") Long userId);

    // שליפה בודדת לבדיקת הרשאות בהורדה
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Font f " +
            "LEFT JOIN PermissionedPeople pp ON f.id = pp.font.id " +
            "WHERE f.id = :fontId AND (" +
            "   f.permission = 'public' " +
            "   OR f.owner.id = :userId " +
            "   OR (f.permission = 'restricted' AND pp.user.id = :userId)" +
            ")")
    boolean hasPermission(@Param("fontId") Long fontId, @Param("userId") Long userId);
}



