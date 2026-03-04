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

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Font getFont() { return font; }
    public void setFont(Font font) { this.font = font; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
