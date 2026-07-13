package com.hand2font.dto;

import com.hand2font.model.enums.Permission;
import lombok.Data;

import java.util.List;

@Data
public class FontCreationRequest {
    private String fontName;
    private Long ownerId;
    private String filePath;
    private Permission permission; // public, private, restricted
    private List<String> allowedEmails;


    public String getFontName() { return fontName; }
    public Long getOwnerId() { return ownerId; }
    public String getFilePath() { return filePath; }
    public Permission getPermission() { return permission; }
    public List<String> getAllowedEmails() { return allowedEmails; }

    public void setFontName(String fontName) { this.fontName = fontName; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public void setPermission(Permission permission) { this.permission = permission; }
    public void setAllowedEmails(List<String> allowedEmails) { this.allowedEmails = allowedEmails; }
}