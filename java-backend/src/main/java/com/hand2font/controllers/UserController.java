package com.hand2font.controllers;

import com.hand2font.config.JwtUtil;
import com.hand2font.model.Font;
import com.hand2font.model.User;
import com.hand2font.service.FontService;
import com.hand2font.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final FontService fontService;

    public UserController(UserService userService, JwtUtil jwtUtil, FontService fontService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.fontService = fontService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User savedUser = userService.register(user);
            String token = jwtUtil.generateToken(savedUser.getEmail());
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user",
                    savedUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        User user = userService.login(email, password);

        if (user != null) {
            String token = jwtUtil.generateToken(user.getEmail());
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "fullName", user.getFullName(),
                    "email", user.getEmail()
            ));
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Principal principal) {
        try {
            User user = userService.getAuthenticatedUser(principal);
            List<Font> userFonts = fontService.getFontsByUser(user);

            return ResponseEntity.ok(Map.of(
                    "user", user,
                    "fonts", userFonts
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails, Principal principal) {
        try {
            User updatedUser = userService.updateUser(id, userDetails, principal);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "שגיאה בעדכון המשתמש: " + e.getMessage()));
        }
    }
}