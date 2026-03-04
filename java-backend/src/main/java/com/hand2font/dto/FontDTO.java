package com.hand2font.dto;

import com.hand2font.model.FontStatus;
import lombok.Data;

@Data
public class FontDTO {
    private Long id;
    private String fontName;
    private String ownerName;
    private String status;
    private String geometricStyle;
    private String contentStyle;
    private String expressionStyle;


    // קונסטרקטור הממיר מה-Entity ל-DTO
    public FontDTO(Long id, String fontName, String ownerName,FontStatus status,
                   String geometricStyle, String contentStyle, String expressionStyle) {
        this.id = id;
        this.fontName = fontName;
        this.ownerName = ownerName;
        this.status = status.name();
        this.geometricStyle = geometricStyle;
        this.contentStyle = contentStyle;
        this.expressionStyle = expressionStyle;

    }
}