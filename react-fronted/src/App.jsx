import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import {useEffect, useState} from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Fonts from './pages/Fonts'
import CreateFont from './pages/CreateFont'
import Dashboard from './pages/Dashboard'
import { getMe } from './features/auth/authService'

// קומפוננטה להגנה על דפים שדורשים התחברות
function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
  const checkAuth = async () => {
    try {
      const data = await getMe() 
      console.log('Authorized user:', data)
      setAuthorized(true)
    } catch (err) {
      console.error('Auth check failed:', err)
      localStorage.removeItem('token')
      setAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  checkAuth()
}, [])

  if (loading) {
    return <div>בודק הרשאה...</div> // הודעת טעינה בזמן הבדיקה
  }

  if (!authorized) {
    return <Navigate to="/login" replace /> // הפניה לדף התחברות אם לא מורשה
  }

  return children
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    navigate('/login')
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%'
    }}>
      {/* Navigation */}
      <nav style={{ 
        background: '#2c3e50', 
        color: 'white', 
        padding: '1rem',
        display: 'flex',
        gap: '1.5rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
        width: '100%'
      }}>
        <Link to="/" style={{ 
          color: 'white', 
          textDecoration: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          transition: 'background 0.3s'
        }}>בית</Link>
        
        

        {/* קישורים רק למשתמשים מחוברים */}
        {isLoggedIn && (
          <>
            <Link to="/create" style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px'
            }}>יצירת פונט</Link>
            
            <Link to="/dashboard" style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px'
            }}>אזור אישי</Link>

            <Link to="/fonts" style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px'
            }}>פונטים</Link>
            
            <button 
              onClick={handleLogout}
              style={{ 
                color: 'white', 
                background: 'transparent', 
                border: '1px solid white', 
                borderRadius: '4px', 
                padding: '0.5rem 1rem', 
                cursor: 'pointer'
              }}
            >
              יציאה
            </button>
          </>
        )}
        
        {/* קישורים רק למשתמשים לא מחוברים */}
        {!isLoggedIn && (
          <>
            <Link to="/login" style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px'
            }}>התחברות</Link>
            
            <Link to="/register" style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px'
            }}>הרשמה</Link>
          </>
        )}
      </nav>

      {/* Main Content */}
      <main style={{ 
        flex: 1,
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        <Routes>
          {/* דפים פתוחים לכולם */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/fonts" element={<Fonts />} />
          <Route path="/fonts/:id" element={<div style={{ padding: '2rem' }}>פרטי פונט</div>} />
        
          
          {/* דפים מוגנים - רק למשתמשים מחוברים */}
          <Route path="/create" element={
            <ProtectedRoute>
              <CreateFont />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{ 
        background: '#34495e', 
        color: 'white',
        padding: '1.5rem', 
        textAlign: 'center',
        marginTop: 'auto',
        width: '100%'
      }}>
        <p>© 2026 מערכת יצירת פונטים | כל הזכויות שמורות</p>
      </footer>
    </div>
  )
}

// עטיפה ב-Router
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  )
}