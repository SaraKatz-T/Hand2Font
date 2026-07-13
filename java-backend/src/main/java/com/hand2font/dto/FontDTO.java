package com.hand2font.dto;

import lombok.Data;
import java.util.List;

@Data
public class FontDTO {
    private Long id;
    private String fontName;
    private String ownerName;
    private String status;
    private String filePath;
    private String permission;      // שדה חדש לסוג ההרשאה
    private List<String> allowedViewEmails; // שדה חדש לרשימת המיילים
    private String geometricStyle;
    private String contentStyle;
    private String expressionStyle;
    private int downloadCount;
    private String creationDate;

    public FontDTO(Long id, String fontName, String ownerName, String status, String filePath,
                   String permission, List<String> allowedViewEmails,
                   String geometricStyle, String contentStyle, String expressionStyle,int downloadCount, String creationDate) {
        this.id = id;
        this.fontName = fontName;
        this.ownerName = ownerName;
        this.status = status;
        this.filePath = filePath;
        this.permission = permission;
        this.allowedViewEmails = allowedViewEmails;
        this.geometricStyle = geometricStyle;
        this.contentStyle = contentStyle;
        this.expressionStyle = expressionStyle;
        this.downloadCount = downloadCount;
        this.creationDate = creationDate;
    }
}
