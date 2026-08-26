import api from '../../services/api'

export const registerUser = async (user) => {
  const res = await api.post('/users/register', user)
  return res.data
}

export const loginUser = async (credentials) => {
  try {
    const res = await api.post('/users/login', credentials)
    return res.data
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error('אימייל או סיסמה אינם נכונים')
    }
    throw new Error(error.message || 'שגיאה בהתחברות לשרת')
  }
}

export const getMe = async () => {
  const res = await api.get('/users/me')
   return res.data
}


