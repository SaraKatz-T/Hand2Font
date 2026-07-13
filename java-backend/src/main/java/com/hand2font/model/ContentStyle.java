package com.hand2font.model;

import jakarta.persistence.*;

@Entity
@Table(name = "content_styles")
public class ContentStyle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // רשמי, ידידותי, יומיומי-קלאסי


    // 1. בנאי ריק - חובה עבור Hibernate/JPA
    public ContentStyle() {}

    // 2. בנאי עם שם
    public ContentStyle(String name) {
        this.name = name;
    }


    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
