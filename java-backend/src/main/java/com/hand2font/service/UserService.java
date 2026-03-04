package com.hand2font.service;

import com.hand2font.model.User;
import com.hand2font.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // פונקציה לזיהוי המשתמש המחובר
    public User getAuthenticatedUser(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("User not authenticated");
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()))
                .orElse(null);
    }

    public User updateUser(Long idToUpdate, User userDetails, Principal principal) {
        User currentUser = getAuthenticatedUser(principal);

        if (!currentUser.getId().equals(idToUpdate)) {
            throw new RuntimeException("You are not authorized to update this profile");
        }

        currentUser.setFullName(userDetails.getFullName());
        currentUser.setEmail(userDetails.getEmail());

        return userRepository.save(currentUser);
    }

    public Optional<User> findByEmail(String email) {

        return userRepository.findByEmail(email);
    }
}