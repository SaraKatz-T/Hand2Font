import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // <-- מוסיף פתיחה אוטומטית של הדפדפן
    proxy: {
      // אנחנו מגדירים את ה-proxy על הנתיב של ה-WebSocket בנפרד
      '/api/ws-font-status': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false,
        ws: true, // עכשיו זה אמור להיות תקין כי זה בתוך הגדרת נתיב ספציפי
      },
      // שאר ה-API הרגיל
      '/api': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false,
      },
    }
  },
  define: {
    // הגדרת global כדי שספריות ישנות יעבדו בדפדפן
    global: 'window',
  },
})
