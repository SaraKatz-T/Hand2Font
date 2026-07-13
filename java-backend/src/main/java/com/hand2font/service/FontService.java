package com.hand2font.service;

import com.hand2font.config.RabbitMQConfig;
import com.hand2font.dto.FontCreationRequest;
import com.hand2font.dto.FontDTO;
import com.hand2font.model.Font;
import com.hand2font.model.FontStatus;
import com.hand2font.model.PermissionedPeople;
import com.hand2font.model.User;
import com.hand2font.model.enums.Permission;
import com.hand2font.repository.*;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import com.hand2font.model.GeometricStyle;
import com.hand2font.model.ContentStyle;
import com.hand2font.model.ExpressionStyle;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.stream.Collectors;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FontService {

    private final FontRepository fontRepository;
    private final UserRepository userRepository;
    private final RabbitTemplate rabbitTemplate;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final PermissionedPeopleRepository permissionedPeopleRepository;
    private final GeometricStyleRepository geometricStyleRepository;
    private final ContentStyleRepository contentStyleRepository;
    private final ExpressionStyleRepository expressionStyleRepository;
    private final ImageValidationService imageValidationService;


    public FontService(FontRepository fontRepository, UserRepository userRepository, RabbitTemplate rabbitTemplate,org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate,PermissionedPeopleRepository permissionedPeopleRepository,GeometricStyleRepository geometricStyleRepository,
                       ContentStyleRepository contentStyleRepository,
                       ExpressionStyleRepository expressionStyleRepository,
                       ImageValidationService imageValidationService) {
        this.fontRepository = fontRepository;
        this.userRepository = userRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.messagingTemplate = messagingTemplate;
        this.permissionedPeopleRepository = permissionedPeopleRepository;
        this.geometricStyleRepository = geometricStyleRepository;
        this.contentStyleRepository = contentStyleRepository;
        this.expressionStyleRepository = expressionStyleRepository;
        this.imageValidationService = imageValidationService;
    }

    @RabbitListener(queues = RabbitMQConfig.STATUS_UPDATES_QUEUE)
    public void handleStatusUpdate(String rawMessage) {
        try {
            String[] parts = rawMessage.split("\\|", 6);
            Long fontId = Long.parseLong(parts[0]);
            String statusName = parts[1];

            Font font = fontRepository.findById(fontId).orElseThrow();
            ObjectMapper mapper = new ObjectMapper();

            // הודעת התיוג: מעדכנת תגיות בלבד, אינה משנה סטטוס, ושולחת ללקוח אירוע עם הערכים
            if ("TAGGED".equals(statusName) && parts.length >= 6) {
                font.setGeometricStyle(geometricStyleRepository.findByName(parts[3]).orElse(null));
                font.setContentStyle(contentStyleRepository.findByName(parts[4]).orElse(null));
                font.setExpressionStyle(expressionStyleRepository.findByName(parts[5]).orElse(null));
                fontRepository.save(font);

                Map<String, Object> event = new HashMap<>();
                event.put("status", "TAGGED");
                event.put("geometric",  parts[3]);
                event.put("content",    parts[4]);
                event.put("expression", parts[5]);
                messagingTemplate.convertAndSend("/topic/status/" + fontId, mapper.writeValueAsString(event));

                System.out.println("Tags updated for Font " + fontId);
                return;
            }

            // הודעות סטטוס רגילות: PROCESSING / COMPLETED / FAILED
            FontStatus status = FontStatus.valueOf(statusName);
            font.setStatus(status);
            if (status == FontStatus.COMPLETED && parts.length >= 3) {
                font.setFilePath(parts[2]);
            }
            fontRepository.save(font);

            Map<String, Object> event = new HashMap<>();
            event.put("status", status.toString());
            messagingTemplate.convertAndSend("/topic/status/" + fontId, mapper.writeValueAsString(event));

            System.out.println("Update: Font " + fontId + " is now " + status);

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
        font.setUuid(java.util.UUID.randomUUID().toString());
        Font savedFont = fontRepository.save(font);

        // לוגיקת הוספת המורשים
        if (request.getPermission() == Permission.RESTRICTED && request.getAllowedEmails() != null) {
            for (String email : request.getAllowedEmails()) {
                PermissionedPeople permissionEntry = new PermissionedPeople();
                permissionEntry.setFont(savedFont);
                permissionEntry.setEmail(email.trim().toLowerCase()); // חשוב: ניקוי רווחים ואותיות קטנות
                permissionedPeopleRepository.save(permissionEntry);

                System.out.println("Saved permission for: " + email); // הדפסה לביקורת ב-Log
            }
        }

        try {
            List<String> geometricLabels = geometricStyleRepository.findAll().stream()
                    .map(GeometricStyle::getName)
                    .collect(Collectors.toList());
            List<String> contentLabels = contentStyleRepository.findAll().stream()
                    .map(ContentStyle::getName)
                    .collect(Collectors.toList());
            List<String> expressionLabels = expressionStyleRepository.findAll().stream()
                    .map(ExpressionStyle::getName)
                    .collect(Collectors.toList());
            Map<String, Object> messageBody = new HashMap<>();
            messageBody.put("font_id", savedFont.getId());
            messageBody.put("font_uuid", savedFont.getUuid());
            messageBody.put("font_name", font.getFontName());
            messageBody.put("image_path", savedFont.getFilePath());
            messageBody.put("target_path", "C:/uploads/fonts/" + savedFont.getUuid() + ".ttf");
            messageBody.put("geometric_labels", geometricLabels);
            messageBody.put("content_labels", contentLabels);
            messageBody.put("expression_labels", expressionLabels);

            // הפיכה ל-JSON
            ObjectMapper objectMapper = new ObjectMapper();
            String jsonMessage = objectMapper.writeValueAsString(messageBody);

            // שליחה לתור
            rabbitTemplate.convertAndSend(RabbitMQConfig.FONT_TASKS_QUEUE, jsonMessage);
            System.out.println("Sent JSON to Python: " + jsonMessage);

        } catch (Exception e) {
            System.err.println("Failed to send RabbitMQ message: " + e.getMessage());
            // כאן כדאי אולי לעדכן סטטוס ל-FAILED ב-DB אם השליחה נכשלה
        }

        return savedFont;
    }

    public String handleImageUpload(MultipartFile image) throws IOException {
        String extension = imageValidationService.validateAndGetExtension(image);

        String uploadDir = "C:/uploads/user_images/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String fileName = java.util.UUID.randomUUID() + extension;
        String fullPath = uploadDir + fileName;
        image.transferTo(new File(fullPath));

        return fullPath;
    }

    public List<FontDTO> getAllFontsForUser(Long userId, String email) {
        List<Font> fonts = fontRepository.findAllAllowedFonts(userId, email);
        return fonts.stream().map(font -> {
            List<String> emails = font.getPermissionedPeople().stream()
                    .map(PermissionedPeople::getEmail)
                    .collect(Collectors.toList());

            return new FontDTO(
                    font.getId(),
                    font.getFontName(),
                    font.getOwner() != null ? font.getOwner().getFullName() : "Unknown",
                    font.getStatus().name(), // המרה מ-Enum ל-String
                    font.getFilePath(),
                    font.getPermission().name(), // המרה מ-Enum ל-String (זה ה-permission שחיפשת)
                    emails, // רשימת המיילים ששלפנו רגע לפני
                    font.getGeometricStyle() != null ? font.getGeometricStyle().getName() : "Standard",
                    font.getContentStyle() != null ? font.getContentStyle().getName() : "Standard",
                    font.getExpressionStyle() != null ? font.getExpressionStyle().getName() : "Standard",
                    font.getDownloadCount(),
                    font.getCreationDate() != null ? font.getCreationDate().toString() : ""
            );
        }).collect(Collectors.toList());
    }

    public Resource getFontFile(Long fontId, Long userId, String userEmail){
        if (!fontRepository.hasPermission(fontId, userId,userEmail)) {
            throw new RuntimeException("Access Denied: No permission to download this font.");
        }

        Font font = fontRepository.findById(fontId)
                .orElseThrow(() -> new RuntimeException("Font not found"));

        File file = new File(font.getFilePath());
        System.out.println("DEBUG: Looking for file at: " + file.getAbsolutePath());
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
        return fontRepository.findByOwnerOrderByIdDesc(owner);
    }

    public Font getFontById(Long id) {
        return fontRepository.findById(id).orElse(null);
    }

    @jakarta.transaction.Transactional
    public void updateFontPermissions(Long fontId, Long userId, Permission permission, List<String> allowedEmails) {
        Font font = fontRepository.findById(fontId)
                .orElseThrow(() -> new RuntimeException("Font not found"));

        if (!font.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Only the owner can change permissions");
        }

        font.setPermission(permission);
        permissionedPeopleRepository.deleteByFont(font);

        if (permission == Permission.RESTRICTED && allowedEmails != null) {
            for (String email : allowedEmails) {
                PermissionedPeople pp = new PermissionedPeople();
                pp.setFont(font);
                pp.setEmail(email.trim().toLowerCase());
                permissionedPeopleRepository.save(pp);
            }
        }
        fontRepository.save(font);
    }

    @jakarta.transaction.Transactional
    public void deleteFont(Long fontId, Long userId) {
        // 1. מציאת הפונט
        Font font = fontRepository.findById(fontId)
                .orElseThrow(() -> new RuntimeException("הפונט לא נמצא"));

        // 2. בדיקת הרשאה (רק הבעלים מוחק)
        if (!font.getOwner().getId().equals(userId)) {
            throw new RuntimeException("אין לך הרשאה למחוק פונט זה");
        }

        // 3. שמירת נתיב הקובץ לפני המחיקה מה-DB כדי שנוכל למחוק אותו מהכונן
        String filePath = font.getFilePath();

        // 4. מחיקת הפונט מה-DB
        // ה-CascadeType.ALL ידאג למחוק את ה-PermissionedPeople אוטומטית!
        fontRepository.delete(font);

        // 5. מחיקה פיזית של הקובץ מהשרת (ניקוי C:/uploads/...)
        if (filePath != null) {
            try {
                java.io.File file = new java.io.File(filePath);
                if (file.exists()) {
                    boolean deleted = file.delete();
                    if (deleted) {
                        System.out.println("[System] File deleted successfully: " + filePath);
                    }
                }
            } catch (Exception e) {
                System.err.println("[Error] Could not delete physical file: " + e.getMessage());
            }
        }
    }
}