package com.hand2font.dto;

import lombok.Data;

@Data
public class FontCreationRequest {
    private String fontName;
    private Long ownerId;
    private String filePath;
    private String permission; // public, private, restricted
}