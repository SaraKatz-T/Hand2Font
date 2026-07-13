package com.hand2font.repository;

import com.hand2font.model.Font;
import com.hand2font.model.PermissionedPeople;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PermissionedPeopleRepository extends JpaRepository<PermissionedPeople, Long> {

    @Modifying
    @Transactional
    void deleteByFont(Font font); // זה יאפשר לנו לנקות את הרשימה הישנה לפני ששומרים חדשה
}