
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../features/auth/authService'

// ====== ערכת העיצוב (Hand2Font) ======
const T = {
  surface: '#FFFFFF', ink: '#241C15', inkSoft: '#736A5E', inkFaint: '#A79E90',
  hair: '#EBE4D7', hairStrong: '#DDD4C3', orange: '#E8741E', indigo: '#3F40C4',
  shadow: '0 1px 2px rgba(36,28,21,.04), 0 8px 30px rgba(36,28,21,.05)',
  fontSans: "'Assistant', sans-serif", fontSerif: "'Frank Ruhl Libre', serif",
}

if (typeof document !== 'undefined' && !document.getElementById('h2f-fonts')) {
  const link = document.createElement('link')
  link.id = 'h2f-fonts'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&family=Frank+Ruhl+Libre:wght@400;500;700&display=swap'
  document.head.appendChild(link)
}

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'אימייל הוא שדה חובה'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'אימייל לא תקין'
    }
    if (!formData.password) newErrors.password = 'סיסמה היא שדה חובה'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validateForm()) return
    setIsLoading(true)
    try {
      const data = await loginUser({ email: formData.email, password: formData.password })
      localStorage.setItem('token', data.token)
      navigate('/dashboard')
      window.location.reload()
    } catch (error) {
      setServerError(error.message || 'שגיאה בהתחברות לשרת')
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = (hasError) => ({
    width: '100%', padding: '12px 14px',
    border: `1px solid ${hasError ? '#c0492b' : T.hairStrong}`,
    borderRadius: '10px', fontSize: '1rem', fontFamily: T.fontSans,
    background: '#FCFAF6', color: T.ink, outline: 'none', transition: '.2s',
  })

  return (
    <div style={{ maxWidth: '460px', margin: '0 auto', padding: '3rem 1.5rem', direction: 'rtl', fontFamily: T.fontSans, color: T.ink }}>
      <div style={{ background: T.surface, borderRadius: '18px', boxShadow: T.shadow, border: `1px solid ${T.hair}`, padding: '2.5rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '0.4rem', fontFamily: T.fontSerif, fontWeight: 500, fontSize: '1.9rem' }}>
          התחברות
        </h1>
        <p style={{ textAlign: 'center', color: T.inkSoft, fontSize: '0.95rem', marginBottom: '1.9rem' }}>טוב לראות אתכם שוב</p>

        {serverError && (
          <div style={{ background: '#FCEDEA', color: '#a3331c', padding: '0.85rem', borderRadius: '10px', marginBottom: '1.4rem', textAlign: 'center', fontSize: '0.9rem' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={labelStyle}>אימייל</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              style={{ ...inputStyle(errors.email), direction: 'ltr', textAlign: 'right' }} placeholder="example@email.com" />
            {errors.email && <span style={errStyle}>{errors.email}</span>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>סיסמה</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              style={inputStyle(errors.password)} placeholder="הזינו סיסמה" />
            {errors.password && <span style={errStyle}>{errors.password}</span>}
          </div>

          <button type="submit" disabled={isLoading}
            style={{
              width: '100%', padding: '0.95rem', background: isLoading ? T.hairStrong : T.orange,
              color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.05rem',
              fontWeight: 600, fontFamily: T.fontSans, cursor: isLoading ? 'not-allowed' : 'pointer', transition: '.2s',
              marginTop: '0.5rem',
            }}>
            {isLoading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: T.inkSoft, fontSize: '0.95rem' }}>
          עדיין אין לכם חשבון?{' '}
          <Link to="/register" style={{ color: T.indigo, textDecoration: 'none', fontWeight: 600 }}>הירשמו כאן</Link>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', marginBottom: '0.5rem', color: '#241C15', fontWeight: 600, fontSize: '0.9rem' }
const errStyle = { color: '#c0492b', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }
