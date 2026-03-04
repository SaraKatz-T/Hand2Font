package com.hand2font.model;

public enum FontStatus {
    PENDING,    // הפונט מחכה בתור לעיבוד
    PROCESSING, // הפייתון עובד על הפונט כרגע
    COMPLETED,  // הפונט מוכן
    FAILED      // הייתה שגיאה בתהליך
}