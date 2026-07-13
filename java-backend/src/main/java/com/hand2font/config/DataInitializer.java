package com.hand2font.config;

import com.hand2font.model.*;
import com.hand2font.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(
            GeometricStyleRepository geoRepo,
            ContentStyleRepository contentRepo,
            ExpressionStyleRepository expRepo) {

        return args -> {
            // 1. אתחול סגנונות גיאומטריים (מ-LLaVA)
            if (geoRepo.count() == 0) {
                geoRepo.saveAll(List.of(
                        new GeometricStyle("round"),
                        new GeometricStyle("angular"),
                        new GeometricStyle("slanted")
                ));
            }

            // 2. אתחול סגנונות תוכן (מ-BART)
            if (contentRepo.count() == 0) {
                contentRepo.saveAll(List.of(
                        new ContentStyle("formal and official"),
                        new ContentStyle("casual and daily"),
                        new ContentStyle("social and friendly")
                ));
            }

            // 3. אתחול סגנונות הבעה/Vibe (מ-LLaVA)
            if (expRepo.count() == 0) {
                expRepo.saveAll(List.of(
                        new ExpressionStyle("playful"),
                        new ExpressionStyle("mature"),
                        new ExpressionStyle("messy")
                ));
            }

            System.out.println(">>> System Styles Initialized Successfully <<<");
        };
    }
}