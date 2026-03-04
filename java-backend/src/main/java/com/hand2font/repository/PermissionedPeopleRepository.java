package com.hand2font.repository;

import com.hand2font.model.PermissionedPeople;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PermissionedPeopleRepository extends JpaRepository<PermissionedPeople, Long> {
}