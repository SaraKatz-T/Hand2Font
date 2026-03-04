import api from '../../../services/api'

// יצירת פונט
export const createFont = async (fontData) => {
  try {
    const response = await api.post('/fonts/create', fontData)
    return response.data
  } catch (error) {
    throw error.response?.data || new Error("שגיאה ביצירת הפונט")
  }
}

// שליפת כל הפונטים
export const getAllFonts = async () => {
  try {
    const response = await api.get('/fonts/getFontes')
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

export const fontService = { createFont, getAllFonts, downloadFont }
