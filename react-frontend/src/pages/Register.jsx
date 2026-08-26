// import { useState } from 'react'
// import { useNavigate, Link } from 'react-router-dom'
// import {registerUser} from '../features/auth/authService'

// export default function Register() {
//   const navigate = useNavigate()
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   })
//   const [errors, setErrors] = useState({})
//   const [isLoading, setIsLoading] = useState(false)
//   const [serverError, setServerError] = useState('')

//   // עדכון שדות הטופס
//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }))
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }))
//     }
//   }

//   // ולידציה
//   const validateForm = () => {
//     const newErrors = {}

//     if (!formData.fullName.trim()) {
//       newErrors.fullName = 'שם מלא הוא שדה חובה'
//     } else if (formData.fullName.trim().length < 2) {
//       newErrors.fullName = 'שם מלא חייב להכיל לפחות 2 תווים'
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = 'אימייל הוא שדה חובה'
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = 'אימייל לא תקין'
//     }

//     if (!formData.password) {
//       newErrors.password = 'סיסמה היא שדה חובה'
//     } else if (formData.password.length < 6) {
//       newErrors.password = 'סיסמה חייבת להכיל לפחות 6 תווים'
//     }

//     if (!formData.confirmPassword) {
//       newErrors.confirmPassword = 'יש לאמת את הסיסמה'
//     } else if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'הסיסמאות אינן תואמות'
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   // שליחת הטופס
// const handleSubmit = async (e) => {
//   e.preventDefault()
//   setServerError('')

//   if (!validateForm()) return

//   setIsLoading(true)

//   try {
//     const { token } = await registerUser({
//       fullName: formData.fullName,
//       email: formData.email,
//       password: formData.password
//     })

//     localStorage.setItem('token', token)

//     navigate('/dashboard')
//     window.location.reload()

//   } catch (error) {
//     const message =
//       error.response?.data?.message ||
//       error.message ||
//       'שגיאה בהרשמה'

//     setServerError(message)
//   } finally {
//     setIsLoading(false)
//   }
// }


//   return (
//     <div style={{ maxWidth: '450px', margin: '0 auto', padding: '2rem' }}>
//       <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '2.5rem' }}>
//         <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2c3e50', fontSize: '2rem' }}>
//           הרשמה למערכת
//         </h1>

//         {serverError && (
//           <div style={{ background: '#fee', color: '#c33', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', textAlign: 'center' }}>
//             {serverError}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           {/* שם מלא */}
//           <div style={{ marginBottom: '1.5rem' }}>
//             <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: '500' }}>שם מלא</label>
//             <input
//               type="text"
//               name="fullName"
//               value={formData.fullName}
//               onChange={handleChange}
//               style={{
//                 width: '100%',
//                 padding: '0.75rem',
//                 border: errors.fullName ? '2px solid #c33' : '1px solid #ddd',
//                 borderRadius: '4px',
//                 fontSize: '1rem',
//                 direction: 'rtl'
//               }}
//               placeholder="הזן שם מלא"
//             />
//             {errors.fullName && <span style={{ color: '#c33', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{errors.fullName}</span>}
//           </div>

//           {/* אימייל */}
//           <div style={{ marginBottom: '1.5rem' }}>
//             <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: '500' }}>אימייל</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               style={{
//                 width: '100%',
//                 padding: '0.75rem',
//                 border: errors.email ? '2px solid #c33' : '1px solid #ddd',
//                 borderRadius: '4px',
//                 fontSize: '1rem',
//                 direction: 'ltr',
//                 textAlign: 'right'
//               }}
//               placeholder="example@email.com"
//             />
//             {errors.email && <span style={{ color: '#c33', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{errors.email}</span>}
//           </div>

//           {/* סיסמה */}
//           <div style={{ marginBottom: '1.5rem' }}>
//             <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: '500' }}>סיסמה</label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               style={{
//                 width: '100%',
//                 padding: '0.75rem',
//                 border: errors.password ? '2px solid #c33' : '1px solid #ddd',
//                 borderRadius: '4px',
//                 fontSize: '1rem',
//                 direction: 'rtl'
//               }}
//               placeholder="הזן סיסמה (לפחות 6 תווים)"
//             />
//             {errors.password && <span style={{ color: '#c33', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{errors.password}</span>}
//           </div>

//           {/* אימות סיסמה */}
//           <div style={{ marginBottom: '1.5rem' }}>
//             <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: '500' }}>אימות סיסמה</label>
//             <input
//               type="password"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               style={{
//                 width: '100%',
//                 padding: '0.75rem',
//                 border: errors.confirmPassword ? '2px solid #c33' : '1px solid #ddd',
//                 borderRadius: '4px',
//                 fontSize: '1rem',
//                 direction: 'rtl'
//               }}
//               placeholder="הזן סיסמה שוב"
//             />
//             {errors.confirmPassword && <span style={{ color: '#c33', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>{errors.confirmPassword}</span>}
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             style={{
//               width: '100%',
//               padding: '0.875rem',
//               background: isLoading ? '#95a5a6' : '#3498db',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               fontSize: '1.1rem',
//               fontWeight: '500',
//               cursor: isLoading ? 'not-allowed' : 'pointer',
//               transition: 'background 0.3s'
//             }}
//           >
//             {isLoading ? 'מבצע הרשמה...' : 'הרשמה'}
//           </button>
//         </form>

//         <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#7f8c8d' }}>
//           כבר יש לך חשבון?{' '}
//           <Link to="/login" style={{ color: '#3498db', textDecoration: 'none', fontWeight: '500' }}>
//             התחבר כאן
//           </Link>
//         </div>
//       </div>
//     </div>
//   )
// }


import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../features/auth/authService'

// ====== ערכת העיצוב (Hand2Font) ======
const T = {
  surface: '#FFFFFF', ink: '#241C15', inkSoft: '#736A5E',
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

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
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
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'שם מלא הוא שדה חובה'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'שם מלא חייב להכיל לפחות 2 תווים'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'אימייל הוא שדה חובה'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'אימייל לא תקין'
    }
    if (!formData.password) {
      newErrors.password = 'סיסמה היא שדה חובה'
    } else if (formData.password.length < 6) {
      newErrors.password = 'סיסמה חייבת להכיל לפחות 6 תווים'
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'יש לאמת את הסיסמה'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'הסיסמאות אינן תואמות'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validateForm()) return
    setIsLoading(true)
    try {
      const { token } = await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      })
      localStorage.setItem('token', token)
      navigate('/dashboard')
      window.location.reload()
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'שגיאה בהרשמה'
      setServerError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = (hasError, ltr) => ({
    width: '100%', padding: '12px 14px',
    border: `1px solid ${hasError ? '#c0492b' : T.hairStrong}`,
    borderRadius: '10px', fontSize: '1rem', fontFamily: T.fontSans,
    background: '#FCFAF6', color: T.ink, outline: 'none', transition: '.2s',
    ...(ltr ? { direction: 'ltr', textAlign: 'right' } : {}),
  })

  return (
    <div style={{ maxWidth: '460px', margin: '0 auto', padding: '3rem 1.5rem', direction: 'rtl', fontFamily: T.fontSans, color: T.ink }}>
      <div style={{ background: T.surface, borderRadius: '18px', boxShadow: T.shadow, border: `1px solid ${T.hair}`, padding: '2.5rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '0.4rem', fontFamily: T.fontSerif, fontWeight: 500, fontSize: '1.9rem' }}>
          הרשמה
        </h1>
        <p style={{ textAlign: 'center', color: T.inkSoft, fontSize: '0.95rem', marginBottom: '1.9rem' }}>פחות מדקה, וזה שלכם</p>

        {serverError && (
          <div style={{ background: '#FCEDEA', color: '#a3331c', padding: '0.85rem', borderRadius: '10px', marginBottom: '1.4rem', textAlign: 'center', fontSize: '0.9rem' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={labelStyle}>שם מלא</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
              style={inputStyle(errors.fullName)} placeholder="הזינו שם מלא" />
            {errors.fullName && <span style={errStyle}>{errors.fullName}</span>}
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={labelStyle}>אימייל</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              style={inputStyle(errors.email, true)} placeholder="example@email.com" />
            {errors.email && <span style={errStyle}>{errors.email}</span>}
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={labelStyle}>סיסמה</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              style={inputStyle(errors.password)} placeholder="לפחות 6 תווים" />
            {errors.password && <span style={errStyle}>{errors.password}</span>}
          </div>

          <div style={{ marginBottom: '1.4rem' }}>
            <label style={labelStyle}>אימות סיסמה</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
              style={inputStyle(errors.confirmPassword)} placeholder="הזינו סיסמה שוב" />
            {errors.confirmPassword && <span style={errStyle}>{errors.confirmPassword}</span>}
          </div>

          <button type="submit" disabled={isLoading}
            style={{
              width: '100%', padding: '0.95rem', background: isLoading ? T.hairStrong : T.orange,
              color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.05rem',
              fontWeight: 600, fontFamily: T.fontSans, cursor: isLoading ? 'not-allowed' : 'pointer', transition: '.2s',
            }}>
            {isLoading ? 'מבצע הרשמה...' : 'הרשמה'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: T.inkSoft, fontSize: '0.95rem' }}>
          כבר יש לכם חשבון?{' '}
          <Link to="/login" style={{ color: T.indigo, textDecoration: 'none', fontWeight: 600 }}>התחברו כאן</Link>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', marginBottom: '0.5rem', color: '#241C15', fontWeight: 600, fontSize: '0.9rem' }
const errStyle = { color: '#c0492b', fontSize: '0.82rem', marginTop: '0.3rem', display: 'block' }
