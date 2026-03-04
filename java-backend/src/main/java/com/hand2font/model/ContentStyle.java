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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
