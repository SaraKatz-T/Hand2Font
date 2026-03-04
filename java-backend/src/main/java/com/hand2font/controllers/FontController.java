package com.hand2font.controllers;

import com.hand2font.dto.FontCreationRequest;
import com.hand2font.dto.FontDTO;
import com.hand2font.model.Font;
import com.hand2font.model.User;
import com.hand2font.service.FontService;
import com.hand2font.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/fonts")
public class FontController {

    private final FontService fontService;
    private final UserService userService;

    @Autowired
    public FontController(FontService fontService, UserService userService) {
        this.fontService = fontService;
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<Font> createFont(@RequestBody FontCreationRequest request, Principal principal) {
        User user =userService.getAuthenticatedUser(principal);
        request.setOwnerId(user.getId());

        Font newFont = fontService.createFont(request);
        return ResponseEntity.ok(newFont);
    }

    @GetMapping("/getFontes")
    public List<FontDTO> getAllFonts(Principal principal) {
        User user = userService.getAuthenticatedUser(principal);
        return fontService.getAllFontsForUser(user.getId());
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFont(@PathVariable Long id, Principal principal) {
        User user = userService.getAuthenticatedUser(principal);

        Resource resource = fontService.getFontFile(id, user.getId());
        String filename = fontService.getFileName(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }
}