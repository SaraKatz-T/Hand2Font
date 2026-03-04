package com.hand2font.model;

import jakarta.persistence.*;

@Entity
@Table(name = "expression_styles")
public class ExpressionStyle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // שובב, מסודר, ילדותי

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
