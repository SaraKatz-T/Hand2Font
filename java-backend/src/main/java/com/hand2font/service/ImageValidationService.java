package com.hand2font.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;

@Service
public class ImageValidationService {

    private static final byte[] PNG_SIG  = {(byte) 0x89, 0x50, 0x4E, 0x47};
    private static final byte[] JPEG_SIG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] BMP_SIG  = {0x42, 0x4D};

    public String validateAndGetExtension(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("קובץ ריק");
        }

        byte[] header = new byte[8];
        try (InputStream is = file.getInputStream()) {
            is.read(header);
        }

        String extension = detectExtension(header);
        if (extension == null) {
            throw new IllegalArgumentException("סוג קובץ לא נתמך");
        }

        BufferedImage image;
        try (InputStream is = file.getInputStream()) {
            image = ImageIO.read(is);
        }
        if (image == null) {
            throw new IllegalArgumentException("הקובץ אינו תמונה תקינה");
        }

        return extension;
    }

    private String detectExtension(byte[] header) {
        if (matchesSignature(header, PNG_SIG))  return ".png";
        if (matchesSignature(header, JPEG_SIG)) return ".jpg";
        if (matchesSignature(header, BMP_SIG))  return ".bmp";
        return null;
    }

    private boolean matchesSignature(byte[] header, byte[] signature) {
        if (header.length < signature.length) return false;
        for (int i = 0; i < signature.length; i++) {
            if (header[i] != signature[i]) return false;
        }
        return true;
    }
}