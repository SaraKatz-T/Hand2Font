package com.hand2font.config;

import com.hand2font.model.*;
import com.hand2font.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepo,
            FontRepository fontRepo,
            GeometricStyleRepository geoRepo,
            ContentStyleRepository contentRepo,
            ExpressionStyleRepository expRepo,
            PermissionedPeopleRepository permRepo) {

        return args -> {
            // בדיקה אם כבר יש נתונים - אם הטבלה לא ריקה, אל תעשה כלום
            if (userRepo.count() > 0) {
                System.out.println(">>> Data already exists, skipping initialization. <<<");
                return;
            }

            // 1. יצירת סגנונות
            GeometricStyle geo1 = new GeometricStyle(); geo1.setName("עגול");
            GeometricStyle geo2 = new GeometricStyle(); geo2.setName("מחודד");
            geoRepo.save(geo1); geoRepo.save(geo2);

            ContentStyle cont1 = new ContentStyle(); cont1.setName("רשמי");
            ContentStyle cont2 = new ContentStyle(); cont2.setName("ידידותי");
            contentRepo.save(cont1); contentRepo.save(cont2);

            ExpressionStyle exp1 = new ExpressionStyle(); exp1.setName("שובב");
            ExpressionStyle exp2 = new ExpressionStyle(); exp2.setName("מסודר");
            expRepo.save(exp1); expRepo.save(exp2);

            // 2. יצירת משתמשים
            User admin = new User();
            admin.setFullName("משה כהן");
            admin.setEmail("moshe@example.com");
            admin.setPassword("hashed_pass_1");
            userRepo.save(admin);

            User client = new User();
            client.setFullName("דוד לוי");
            client.setEmail("david@example.com");
            client.setPassword("hashed_pass_2");
            userRepo.save(client);

            // 3. יצירת פונטים
            Font publicFont = new Font();
            publicFont.setFontName("דבש מתוק");
            publicFont.setOwner(admin);
            publicFont.setFilePath("C:/Users/WIN 11/Desktop/project/projects/myfont.ttf");
            publicFont.setPermission("public");
            publicFont.setCreationDate(LocalDate.now());
            publicFont.setGeometricStyle(geo1);
            publicFont.setContentStyle(cont2);
            publicFont.setExpressionStyle(exp1);
            fontRepo.save(publicFont);

            Font restrictedFont = new Font();
            restrictedFont.setFontName("פרויקט מיוחד");
            restrictedFont.setOwner(admin);
            restrictedFont.setFilePath("C:/Users/WIN 11/Desktop/project/projects/myfont.ttf");
            restrictedFont.setPermission("restricted");
            restrictedFont.setCreationDate(LocalDate.now());
            restrictedFont.setGeometricStyle(geo2);
            restrictedFont.setContentStyle(cont1);
            fontRepo.save(restrictedFont);

            // 4. מתן הרשאה
            PermissionedPeople perm = new PermissionedPeople();
            perm.setFont(restrictedFont);
            perm.setUser(client);
            permRepo.save(perm);

            System.out.println(">>> Data Initialization Complete! <<<");
        };
    }
}