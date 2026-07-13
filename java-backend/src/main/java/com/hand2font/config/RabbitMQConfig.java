package com.hand2font.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // התור שבו הפייתון יחפש עבודה
    public static final String FONT_TASKS_QUEUE = "font_tasks";

    // התור שבו הג'אווה מחכה לעדכוני סטטוס מהפייתון
    public static final String STATUS_UPDATES_QUEUE = "font_status_updates";

    @Bean
    public Queue fontTasksQueue() {
        return new Queue(FONT_TASKS_QUEUE, true);
    }

    @Bean
    public Queue statusUpdatesQueue() {
        return new Queue(STATUS_UPDATES_QUEUE, true);
    }
}