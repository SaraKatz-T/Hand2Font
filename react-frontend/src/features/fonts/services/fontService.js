import api from '../../../services/api'

// יצירת פונט
export const createFont = async (formData) => {
  try {
    const response = await api.post('/fonts/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    // הדפסה מפורטת יותר לדיבאגינג
    if (error.response) {
      console.error("Server Error Data:", error.response.data);
      console.error("Server Status:", error.response.status);
    } else if (error.request) {
      console.error("No response received from server");
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error.response?.data || new Error("שגיאה בתקשורת עם השרת");
  }
};

// שליפת כל הפונטים
export const getAllFonts = async () => {
  try {
    const response = await api.get('/fonts/getFonts')
    return response.data
  } catch (error) {
    throw error.response?.data || new Error("שגיאה בשליפת הפונטים")
  }
}

// הורדת פונט
export const downloadFont = async (id, fontName) => {
  try {
    const response = await api.get(`/fonts/download/${id}`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${fontName}.ttf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    throw error.response?.data || new Error("שגיאה בהורדת הפונט")
  }
}

// שליפת סטטוס עדכני של פונט בודד
export const getFontStatus = async (id) => {
  try {
    const response = await api.get(`/fonts/status/${id}`)
    return response.data // יחזיר מחרוזת: PENDING, PROCESSING, COMPLETED, FAILED
  } catch (error) {
    throw error.response?.data || new Error("שגיאה בשליפת סטטוס הפונט")
  }
}

export const fontService = { createFont, getAllFonts, downloadFont, getFontStatus }