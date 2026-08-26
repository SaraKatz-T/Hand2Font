// import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
// import {useEffect, useState} from 'react'
// import Home from './pages/Home'
// import Login from './pages/Login'
// import Register from './pages/Register'
// import Fonts from './pages/Fonts'
// import CreateFont from './pages/CreateFont'
// import Dashboard from './pages/Dashboard'
// import { getMe } from './features/auth/authService'
// import FontDetails from './pages/FontDetails'

// // קומפוננטה להגנה על דפים שדורשים התחברות
// function ProtectedRoute({ children }) {
//   const [loading, setLoading] = useState(true)
//   const [authorized, setAuthorized] = useState(false)

//   useEffect(() => {
//   const checkAuth = async () => {
//     try {
//       const data = await getMe() 
//       console.log('Authorized user:', data)
//       setAuthorized(true)
//     } catch (err) {
//       console.error('Auth check failed:', err)
//       localStorage.removeItem('token')
//       setAuthorized(false)
//     } finally {
//       setLoading(false)
//     }
//   }

//   checkAuth()
// }, [])

//   if (loading) {
//     return <div>בודק הרשאה...</div> // הודעת טעינה בזמן הבדיקה
//   }

//   if (!authorized) {
//     return <Navigate to="/login" replace /> // הפניה לדף התחברות אם לא מורשה
//   }

//   return children
// }

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
//   const navigate = useNavigate()

//   const handleLogout = () => {
//     localStorage.removeItem('token')
//     setIsLoggedIn(false)
//     navigate('/login')
//   }

//   return (
//     <div style={{ 
//       minHeight: '100vh', 
//       display: 'flex', 
//       flexDirection: 'column',
//       width: '100%'
//     }}>
//       {/* Navigation */}
//       <nav style={{ 
//         background: '#2c3e50', 
//         color: 'white', 
//         padding: '1rem',
//         display: 'flex',
//         gap: '1.5rem',
//         justifyContent: 'center',
//         flexWrap: 'wrap',
//         width: '100%'
//       }}>
//         <Link to="/" style={{ 
//           color: 'white', 
//           textDecoration: 'none',
//           padding: '0.5rem 1rem',
//           borderRadius: '4px',
//           transition: 'background 0.3s'
//         }}>בית</Link>
        
        

//         {/* קישורים רק למשתמשים מחוברים */}
//         {isLoggedIn && (
//           <>
//             <Link to="/create" style={{ 
//               color: 'white', 
//               textDecoration: 'none',
//               padding: '0.5rem 1rem',
//               borderRadius: '4px'
//             }}>יצירת פונט</Link>
            
//             <Link to="/dashboard" style={{ 
//               color: 'white', 
//               textDecoration: 'none',
//               padding: '0.5rem 1rem',
//               borderRadius: '4px'
//             }}>אזור אישי</Link>

//             <Link to="/fonts" style={{ 
//               color: 'white', 
//               textDecoration: 'none',
//               padding: '0.5rem 1rem',
//               borderRadius: '4px'
//             }}>פונטים</Link>
            
//             <button 
//               onClick={handleLogout}
//               style={{ 
//                 color: 'white', 
//                 background: 'transparent', 
//                 border: '1px solid white', 
//                 borderRadius: '4px', 
//                 padding: '0.5rem 1rem', 
//                 cursor: 'pointer'
//               }}
//             >
//               יציאה
//             </button>
//           </>
//         )}
        
//         {/* קישורים רק למשתמשים לא מחוברים */}
//         {!isLoggedIn && (
//           <>
//             <Link to="/login" style={{ 
//               color: 'white', 
//               textDecoration: 'none',
//               padding: '0.5rem 1rem',
//               borderRadius: '4px'
//             }}>התחברות</Link>
            
//             <Link to="/register" style={{ 
//               color: 'white', 
//               textDecoration: 'none',
//               padding: '0.5rem 1rem',
//               borderRadius: '4px'
//             }}>הרשמה</Link>
//           </>
//         )}
//       </nav>

//       {/* Main Content */}
//       <main style={{ 
//         flex: 1,
//         width: '100%',
//         maxWidth: '1200px',
//         margin: '0 auto',
//         padding: '2rem'
//       }}>
//         <Routes>
//           {/* דפים פתוחים לכולם */}
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/fonts" element={<Fonts />} />
//           <Route path="/fonts/:id" element={
//             <ProtectedRoute>
//               <FontDetails />
//             </ProtectedRoute>
//           } />
          
//           {/* דפים מוגנים - רק למשתמשים מחוברים */}
//           <Route path="/create" element={
//             <ProtectedRoute>
//               <CreateFont />
//             </ProtectedRoute>
//           } />
          
//           <Route path="/dashboard" element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           } />
//         </Routes>
//       </main>

//       {/* Footer */}
//       <footer style={{ 
//         background: '#34495e', 
//         color: 'white',
//         padding: '1.5rem', 
//         textAlign: 'center',
//         marginTop: 'auto',
//         width: '100%'
//       }}>
//         <p>© 2026 מערכת יצירת פונטים | כל הזכויות שמורות</p>
//       </footer>
//     </div>
//   )
// }

// // עטיפה ב-Router
// export default function AppWrapper() {
//   return (
//     <Router>
//       <App />
//     </Router>
//   )
// }

import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Fonts from './pages/Fonts'
import CreateFont from './pages/CreateFont'
import Dashboard from './pages/Dashboard'
import { getMe } from './features/auth/authService'
import FontDetails from './pages/FontDetails'

// ====== ערכת העיצוב (Hand2Font) ======
const T = {
  paper: '#FAF7F1', surface: '#FFFFFF', ink: '#241C15', inkSoft: '#736A5E',
  hair: '#EBE4D7', hairStrong: '#DDD4C3', orange: '#E8741E',
  fontSans: "'Assistant', sans-serif",
}

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
    return <div style={{ padding: '3rem', textAlign: 'center', color: T.inkSoft, fontFamily: T.fontSans }}>בודק הרשאה...</div>
  }
  if (!authorized) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const [userName, setUserName] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // טעינת גופני המערכת (פעם אחת, גלובלי לכל הדפים)
    if (!document.getElementById('h2f-fonts')) {
      const link = document.createElement('link')
      link.id = 'h2f-fonts'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&family=Frank+Ruhl+Libre:wght@400;500;700&family=Gveret+Levin&family=Dancing+Script:wght@600;700&display=swap'
      document.head.appendChild(link)
    }
    // שליפת שם המשתמש לתפריט הפרופיל
    if (isLoggedIn) {
      getMe().then(data => {
        const u = data?.user || data
        if (u?.fullName) setUserName(u.fullName)
      }).catch(() => {})
    }
  }, [isLoggedIn])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    navigate('/login')
  }

  const linkStyle = {
    color: '#E8E1D5', textDecoration: 'none', padding: '0.5rem 0.9rem',
    borderRadius: '8px', fontSize: '0.95rem', fontWeight: 500, transition: 'background 0.2s',
  }
  const onHover = (e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')
  const offHover = (e) => (e.currentTarget.style.background = 'transparent')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', background: T.paper, fontFamily: T.fontSans, color: T.ink }}>
      {/* ===== Navigation ===== */}
      <nav style={{
        background: T.ink,
        padding: '0.5rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem', width: '100%', position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* וורדמארק טקסטואלי */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'baseline', textDecoration: 'none', userSelect: 'none', direction: 'ltr' }}>
          <span style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: '30px', color: '#F3ECE0' }}>Hand</span>
          <span style={{ fontFamily: T.fontSans, fontWeight: 700, fontSize: '26px', color: T.orange }}>2</span>
          <span style={{ fontFamily: T.fontSans, fontWeight: 700, fontSize: '26px', color: '#8E8FE6', letterSpacing: '-0.5px' }}>Font</span>
        </Link>

        {/* קישורים */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <Link to="/" style={linkStyle} onMouseOver={onHover} onMouseOut={offHover}>בית</Link>

          {isLoggedIn && (
            <>
              <Link to="/fonts" style={linkStyle} onMouseOver={onHover} onMouseOut={offHover}>ספריית הפונטים</Link>
              <Link to="/create" style={{
                ...linkStyle, background: 'transparent', color: '#FCFAF6', fontWeight: 600,
                border: `1px solid ${T.orange}`, margin: '0 0.3rem',
              }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(232,116,30,0.12)' }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}>
                + פונט חדש
              </Link>

              {/* תפריט פרופיל */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  onBlur={() => setTimeout(() => setProfileOpen(false), 150)}
                  title={userName}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent',
                    border: 'none', borderRadius: '50%', padding: 0, cursor: 'pointer', marginRight: '0.3rem',
                  }}>
                  <span style={{
                    width: '40px', height: '40px', borderRadius: '50%', background: T.orange, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem',
                    border: '2px solid rgba(255,255,255,0.25)',
                  }}>
                    {userName ? userName.trim()[0] : '?'}
                  </span>
                </button>

                {profileOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, minWidth: '190px',
                    background: T.surface, border: `1px solid ${T.hair}`, borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(36,28,21,.18)', overflow: 'hidden', zIndex: 200,
                  }}>
                    {userName && (
                      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.hair}` }}>
                        <div style={{ fontSize: '0.75rem', color: T.inkSoft }}>מחובר כ־</div>
                        <div style={{ fontWeight: 600, color: T.ink, fontSize: '0.92rem' }}>{userName}</div>
                      </div>
                    )}
                    <Link to="/dashboard" onMouseDown={(e) => e.preventDefault()} onClick={() => setProfileOpen(false)}
                      style={{ display: 'block', padding: '11px 16px', textDecoration: 'none', color: T.ink, fontSize: '0.9rem', fontWeight: 500 }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#FCFAF6'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      אזור אישי
                    </Link>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={handleLogout}
                      style={{ display: 'block', width: '100%', textAlign: 'right', padding: '11px 16px', border: 'none', background: 'transparent', color: '#c0492b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: T.fontSans }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#FCFAF6'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      יציאה
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!isLoggedIn && (
            <>
              <Link to="/login" style={linkStyle} onMouseOver={onHover} onMouseOut={offHover}>התחברות</Link>
              <Link to="/register" style={{
                ...linkStyle, background: T.orange, color: '#fff', fontWeight: 600,
              }} onMouseOver={(e) => e.currentTarget.style.background = '#cf6315'} onMouseOut={(e) => e.currentTarget.style.background = T.orange}>
                הרשמה
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ===== Main Content ===== */}
      <main style={{ flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/fonts" element={<Fonts />} />
          <Route path="/fonts/:id" element={
            <ProtectedRoute><FontDetails /></ProtectedRoute>
          } />
          <Route path="/create" element={
            <ProtectedRoute><CreateFont /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
        </Routes>
      </main>

      {/* ===== Footer ===== */}
      <footer style={{
        background: T.ink, color: '#C9BFB0', padding: '1.75rem 1.5rem',
        textAlign: 'center', marginTop: 'auto', width: '100%', fontSize: '0.9rem',
      }}>
        <p>© 2026 Hand2Font · כל הזכויות שמורות</p>
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
