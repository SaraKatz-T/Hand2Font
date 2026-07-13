package com.hand2font.model;

import jakarta.persistence.*;

@Entity
@Table(name = "permissioned_people")
public class PermissionedPeople {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "font_id", nullable = false)
    private Font font;

    @Column(name = "email", nullable = false)
    private String email;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Font getFont() { return font; }
    public void setFont(Font font) { this.font = font; }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) { this.email = email; }
}
