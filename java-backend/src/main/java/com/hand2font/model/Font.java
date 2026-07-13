package com.hand2font.model;

import com.hand2font.model.enums.Permission;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "fonts")
public class Font {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private String uuid;

    @Column(nullable = false)
    private String fontName;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FontStatus status = FontStatus.PENDING;

    @Column(nullable = false)
    private String filePath;

    @Enumerated(EnumType.STRING) // שומר ב-DB את המילה (למשל "PUBLIC") ולא מספר
    @Column(nullable = false)
    private Permission permission = Permission.PRIVATE; // ערך ברירת מחדל בטוח

    @OneToMany(mappedBy = "font", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PermissionedPeople> permissionedPeople = new ArrayList<>();

    private LocalDate creationDate;

    @Column(nullable = false)
    private int downloadCount = 0;

    @ManyToOne
    @JoinColumn(name = "geometric_style_id")
    private GeometricStyle geometricStyle;

    @ManyToOne
    @JoinColumn(name = "content_style_id")
    private ContentStyle contentStyle;

    @ManyToOne
    @JoinColumn(name = "expression_style_id")
    private ExpressionStyle expressionStyle;

    //UUID מתודה שיוצרת את השדה
    @PrePersist
    protected void onCreate() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
        if (this.creationDate == null) {
            this.creationDate = LocalDate.now();
        }
    }


    // ===== GETTERS & SETTERS =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUuid() { return uuid; }
    public void setUuid(String uuid) { this.uuid = uuid; }

    public String getFontName() { return fontName; }
    public void setFontName(String fontName) { this.fontName = fontName; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public FontStatus getStatus() { return status; }
    public void setStatus(FontStatus status) { this.status = status; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Permission getPermission() { return permission; }
    public void setPermission(Permission permission) { this.permission = permission; }

    public LocalDate getCreationDate() { return creationDate; }
    public void setCreationDate(LocalDate creationDate) { this.creationDate = creationDate; }

    public int getDownloadCount() { return downloadCount; }
    public void setDownloadCount(int downloadCount) { this.downloadCount = downloadCount; }

    public GeometricStyle getGeometricStyle() { return geometricStyle; }
    public void setGeometricStyle(GeometricStyle geometricStyle) { this.geometricStyle = geometricStyle; }

    public ContentStyle getContentStyle() { return contentStyle; }
    public void setContentStyle(ContentStyle contentStyle) { this.contentStyle = contentStyle; }

    public ExpressionStyle getExpressionStyle() { return expressionStyle; }
    public void setExpressionStyle(ExpressionStyle expressionStyle) { this.expressionStyle = expressionStyle; }

    public List<PermissionedPeople> getPermissionedPeople() {
        return permissionedPeople;
    }

}
