import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../features/auth/authService'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  // עדכון שדות הטופס
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // ולידציה של הטופס
  const validateForm = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'אימייל הוא שדה חובה'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'אימייל לא תקין'
    }
    if (!formData.password) {
      newErrors.password = 'סיסמה היא שדה חובה'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // שליחת הטופס
  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const data = await loginUser({
        email: formData.email,
        password: formData.password
      })

      // שמירת ה-token
      localStorage.setItem('token', data.token)

      // הפניה לדשבורד
      navigate('/dashboard')

      // רענון כדי שה-navbar יתעדכן
      window.location.reload()
    } catch (error) {
      setServerError(error.message || 'שגיאה בהתחברות לשרת')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '450px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '2.5rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2c3e50', fontSize: '2rem' }}>התחברות למערכת</h1>

        {serverError && (
          <div style={{ background: '#fee', color: '#c33', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', textAlign: 'center' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* אימייל */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: '500' }}>אימייל</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.email ? '2px solid #c33' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                direction: 'ltr',
                textAlign: 'right'
              }}
              placeholder="example@email.com"
            />
            {errors.email && <span style={{ color: '#c33', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{errors.email}</span>}
          </div>

          {/* סיסמה */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: '500' }}>סיסמה</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.password ? '2px solid #c33' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                direction: 'rtl'
              }}
              placeholder="הזן סיסמה"
            />
            {errors.password && <span style={{ color: '#c33', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{errors.password}</span>}
          </div>

          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <Link to="/forgot-password" style={{ color: '#3498db', textDecoration: 'none', fontSize: '0.9rem' }}>שכחתי סיסמה</Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: isLoading ? '#95a5a6' : '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1.1rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s'
            }}
          >
            {isLoading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#7f8c8d' }}>
          עדיין אין לך חשבון?{' '}
          <Link to="/register" style={{ color: '#3498db', textDecoration: 'none', fontWeight: '500' }}>הירשם כאן</Link>
        </div>
      </div>
    </div>
  )
}
