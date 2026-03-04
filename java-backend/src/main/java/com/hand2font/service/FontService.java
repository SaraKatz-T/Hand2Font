package com.hand2font.service;

import com.hand2font.config.RabbitMQConfig;
import com.hand2font.dto.FontCreationRequest;
import com.hand2font.dto.FontDTO;
import com.hand2font.model.Font;
import com.hand2font.model.FontStatus;
import com.hand2font.model.User;
import com.hand2font.repository.FontRepository;
import com.hand2font.repository.UserRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.amqp.rabbit.core.RabbitTemplate;

@Service
public class FontService {

    private final FontRepository fontRepository;
    private final UserRepository userRepository;
    private final RabbitTemplate rabbitTemplate;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public FontService(FontRepository fontRepository, UserRepository userRepository, RabbitTemplate rabbitTemplate,org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate) {
        this.fontRepository = fontRepository;
        this.userRepository = userRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.messagingTemplate = messagingTemplate;
    }

    @RabbitListener(queues = RabbitMQConfig.STATUS_UPDATES_QUEUE)
    public void handleStatusUpdate(String rawMessage) {
        try {
            // המודל מהפייתון: "fontId:status" (למשל "1:PROCESSING")
            String[] parts = rawMessage.split(":");
            Long fontId = Long.parseLong(parts[0]);
            FontStatus status = FontStatus.valueOf(parts[1]);

            Font font = fontRepository.findById(fontId).orElseThrow();
            font.setStatus(status);
            fontRepository.save(font);

            // שליחת הודעה חיה לדפדפן
            messagingTemplate.convertAndSend("/topic/status/" + fontId, status.toString());
            System.out.println("Real-time update sent for Font " + fontId + ": " + status);
        } catch (Exception e) {
            System.err.println("Error processing status update: " + e.getMessage());
        }
    }

    public Font createFont(FontCreationRequest request) {
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Font font = new Font();
        font.setFontName(request.getFontName());
        font.setOwner(owner);
        font.setStatus(FontStatus.PENDING);
        font.setFilePath(request.getFilePath());
        font.setPermission(request.getPermission());
        font.setCreationDate(LocalDate.now());
        font.setDownloadCount(0);

        Font savedFont= fontRepository.save(font);

        rabbitTemplate.convertAndSend(RabbitMQConfig.FONT_TASKS_QUEUE, savedFont.getId().toString());
        System.out.println("Sent message to RabbitMQ for Font ID: " + savedFont.getId());

        return savedFont;
    }


    public List<FontDTO> getAllFontsForUser(Long userId) {
        List<Font> fonts = fontRepository.findAllAllowedFonts(userId);

        return fonts.stream().map(font -> new FontDTO(
                font.getId(),
                font.getFontName(),
                font.getOwner().getFullName(),
                font.getStatus(),
                font.getGeometricStyle() != null ? font.getGeometricStyle().getName() : "Standard",
                font.getContentStyle() != null ? font.getContentStyle().getName() : "Standard",
                font.getExpressionStyle() != null ? font.getExpressionStyle().getName() : "Standard"
        )).collect(Collectors.toList());
    }

    public Resource getFontFile(Long fontId, Long userId) {
        if (!fontRepository.hasPermission(fontId, userId)) {
            throw new RuntimeException("Access Denied: No permission to download this font.");
        }

        Font font = fontRepository.findById(fontId)
                .orElseThrow(() -> new RuntimeException("Font not found"));

        File file = new File(font.getFilePath());
        if (!file.exists()) {
            throw new RuntimeException("Font file not found on server storage.");
        }

        font.setDownloadCount(font.getDownloadCount() + 1);
        fontRepository.save(font);

        return new FileSystemResource(file);
    }

    public String getFileName(Long fontId) {
        Font font = fontRepository.findById(fontId).orElseThrow();
        return new File(font.getFilePath()).getName();
    }

    public List<Font> getFontsByUser(User owner) {
        return fontRepository.findByOwner(owner);
    }
}