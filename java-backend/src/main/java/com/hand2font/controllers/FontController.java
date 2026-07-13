package com.hand2font.controllers;

import com.hand2font.dto.FontCreationRequest;
import com.hand2font.dto.FontDTO;
import com.hand2font.model.Font;
import com.hand2font.model.User;
import com.hand2font.model.enums.Permission;
import com.hand2font.service.FontService;
import com.hand2font.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/fonts")
public class FontController {

    private final FontService fontService;
    private final UserService userService;

    @Autowired
    public FontController(FontService fontService, UserService userService) {
        this.fontService = fontService;
        this.userService = userService;
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createFont(
            @RequestParam("fontName") String fontName,
            @RequestParam("permission") Permission permission,
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "allowedEmails", required = false) List<String> allowedEmails,
            Principal principal) throws IOException {

        String fullPath;
        try {
            fullPath = fontService.handleImageUpload(image);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }

        // 2. בניית ה-Request לפייתון
        FontCreationRequest request = new FontCreationRequest();
        request.setFontName(fontName);
        request.setPermission(permission);
        request.setFilePath(fullPath);
        request.setAllowedEmails(allowedEmails);

        User user = userService.getAuthenticatedUser(principal);
        request.setOwnerId(user.getId());

        Font newFont = fontService.createFont(request);
        return ResponseEntity.ok(newFont);
    }

    @GetMapping("/getFonts")
    public List<FontDTO> getAllFonts(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("User is not authenticated");
        }

        User user = userService.getAuthenticatedUser(principal);
        return fontService.getAllFontsForUser(user.getId(), user.getEmail());
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFont(@PathVariable("id") Long id, Principal principal){
        User user = userService.getAuthenticatedUser(principal);

        Font font = fontService.getFontById(id);

        if (font == null) return ResponseEntity.notFound().build();

        try {
            Resource resource = fontService.getFontFile(id, user.getId(), user.getEmail());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (Exception e) {
            // כאן נדע אם הבעיה היא שהקובץ לא קיים פיזית!
            System.out.println("Error reading file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{fontId}/permissions")
    public ResponseEntity<?> updateFontPermissions(
            @PathVariable("fontId") Long fontId,
            @RequestBody FontCreationRequest request,
            Principal principal) {

        User user = userService.getAuthenticatedUser(principal);

        try {
            fontService.updateFontPermissions(
                    fontId,
                    user.getId(),
                    request.getPermission(),
                    request.getAllowedEmails()
            );
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFont(@PathVariable("id") Long id, Principal principal) {
        try {
            User user = userService.getAuthenticatedUser(principal);
            fontService.deleteFont(id, user.getId());
            return ResponseEntity.ok("message"+ "הפונט נמחק בהצלחה מהמערכת");
        } catch (RuntimeException e) {
            // מחזירים 403 Forbidden אם זו בעיית הרשאה
            return ResponseEntity.status(403).body("error"+ e.getMessage());
        } catch (Exception e) {
            // מחזירים 500 לכל שגיאה אחרת
            return ResponseEntity.status(500).body("אירעה שגיאה בלתי צפויה: " + e.getMessage());
        }
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<String> getFontStatus(@PathVariable("id") Long id, Principal principal) {
        User user = userService.getAuthenticatedUser(principal);
        Font font = fontService.getFontById(id);

        if (font == null) {
            return ResponseEntity.notFound().build();
        }

        // מוודאים שרק הבעלים (או מי שיש לו הרשאה במערכת) יכול לראות את הסטטוס בשלב היצירה
        if (!font.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        // מחזירים את הסטטוס כטקסט (למשל: "PENDING", "COMPLETED")
        return ResponseEntity.ok(font.getStatus().name());
    }
}