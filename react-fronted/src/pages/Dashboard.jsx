import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PermissionsModal from '../features/fonts/components/PermissionsModal'

export default function Dashboard() {
  const [userData, setUserData] = useState(null)
  const [myFonts, setMyFonts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedUserData, setEditedUserData] = useState({})
  const [selectedFont, setSelectedFont] = useState(null)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to load user data')
      const data = await response.json()
      setUserData(data.user)
      setEditedUserData(data.user)
      setMyFonts(data.fonts)
    } catch (error) {
      console.error('שגיאה בטעינת נתונים:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8080/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedUserData)
      })
      if (!response.ok) throw new Error('Failed to update user')
      const updatedUser = await response.json()
      setUserData(updatedUser)
      setIsEditingProfile(false)
      alert('הפרטים עודכנו בהצלחה')
    } catch (error) {
      console.error('שגיאה בעדכון פרטים:', error)
      alert('שגיאה בעדכון הפרטים')
    }
  }

  const handleCancelEdit = () => {
    setEditedUserData(userData)
    setIsEditingProfile(false)
  }

  const handleOpenPermissions = (font) => {
    setSelectedFont(font)
    setShowPermissionsModal(true)
  }

  const handleSavePermissions = (fontId, permissions) => {
    setMyFonts(prev => prev.map(font =>
      font.id === fontId ? { ...font, ...permissions } : font
    ))
    setShowPermissionsModal(false)
    alert('ההרשאות עודכנו בהצלחה')
  }

  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'400px', fontSize:'1.2rem', color:'#666' }}>טוען...</div>

  return (
    <div style={{ padding: '2rem 0', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'3rem', paddingBottom:'1.5rem', borderBottom:'1px solid #e0e0e0' }}>
        <h1 style={{ fontSize:'2rem', color:'#333', fontWeight:'600' }}>אזור אישי</h1>
        <Link to="/create" style={{ padding:'0.7rem 1.5rem', background:'#333', color:'white', textDecoration:'none', borderRadius:'6px', fontSize:'0.95rem', fontWeight:'500' }}>+ פונט חדש</Link>
      </div>

      {/* Profile Section */}
      <div style={{ background:'#fafafa', padding:'2rem', borderRadius:'8px', marginBottom:'3rem', border:'1px solid #e0e0e0' }}>
        {/* פרטי חשבון */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h2 style={{ fontSize:'1.3rem', color:'#333', fontWeight:'600' }}>פרטי חשבון</h2>
          {!isEditingProfile ? (
            <button onClick={() => setIsEditingProfile(true)} style={{ padding:'0.5rem 1.2rem', background:'white', color:'#333', border:'1px solid #ccc', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem', fontWeight:'500' }}>ערוך</button>
          ) : (
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <button onClick={handleSaveProfile} style={{ padding:'0.5rem 1.2rem', background:'#333', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem', fontWeight:'500' }}>שמור</button>
              <button onClick={handleCancelEdit} style={{ padding:'0.5rem 1.2rem', background:'white', color:'#666', border:'1px solid #ccc', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem' }}>ביטול</button>
            </div>
          )}
        </div>

        {/* Inputs */}
        <div style={{ display:'grid', gap:'1.2rem' }}>
          <div>
            <label style={{ display:'block', marginBottom:'0.4rem', color:'#666', fontSize:'0.9rem', fontWeight:'500' }}>שם מלא</label>
            {isEditingProfile ? (
              <input type="text" value={editedUserData.fullName} onChange={(e) => setEditedUserData(prev => ({ ...prev, fullName:e.target.value }))} style={{ width:'100%', padding:'0.7rem', border:'1px solid #ccc', borderRadius:'6px', fontSize:'1rem', direction:'rtl' }} />
            ) : <div style={{ padding:'0.7rem 0', color:'#333', fontSize:'1rem' }}>{userData?.fullName}</div>}
          </div>

          <div>
            <label style={{ display:'block', marginBottom:'0.4rem', color:'#666', fontSize:'0.9rem', fontWeight:'500' }}>אימייל</label>
            {isEditingProfile ? (
              <input type="email" value={editedUserData.email} onChange={(e) => setEditedUserData(prev => ({ ...prev, email:e.target.value }))} style={{ width:'100%', padding:'0.7rem', border:'1px solid #ccc', borderRadius:'6px', fontSize:'1rem', direction:'ltr', textAlign:'right' }} />
            ) : <div style={{ padding:'0.7rem 0', color:'#333', fontSize:'1rem' }}>{userData?.email}</div>}
          </div>
        </div>
      </div>

      {/* My Fonts Section */}
      <div>
        <h2 style={{ fontSize:'1.3rem', marginBottom:'1.5rem', color:'#333', fontWeight:'600' }}>הפונטים שלי ({myFonts.length})</h2>

        {myFonts.length === 0 ? (
          <div style={{ background:'#fafafa', padding:'3rem 2rem', borderRadius:'8px', textAlign:'center', border:'1px solid #e0e0e0' }}>
            <h3 style={{ fontSize:'1.2rem', marginBottom:'0.5rem', color:'#333' }}>עדיין לא יצרת פונטים</h3>
            <p style={{ color:'#666', marginBottom:'1.5rem', fontSize:'0.95rem' }}>התחל ליצור את הפונט הראשון שלך עכשיו</p>
            <Link to="/create" style={{ padding:'0.7rem 1.5rem', background:'#333', color:'white', textDecoration:'none', borderRadius:'6px', fontSize:'0.95rem', fontWeight:'500', display:'inline-block' }}>צור פונט חדש</Link>
          </div>
        ) : (
          <div style={{ display:'grid', gap:'1rem' }}>
            {myFonts.map(font => (
              <div key={font.id} style={{ background:'white', padding:'1.5rem', borderRadius:'8px', border:'1px solid #e0e0e0', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', transition:'border-color 0.2s' }}>
                <div style={{ flex:1 }}>
                  <h3 style={{ fontSize:'1.1rem', marginBottom:'0.3rem', color:'#333', fontWeight:'600' }}>{font.fontName}</h3>
                  <div style={{ display:'flex', gap:'1rem', fontSize:'0.85rem', color:'#666', flexWrap:'wrap' }}>
                    <span>מספר הורדות: {font.downloadCount}</span>
                    <span>•</span>
                    <span>נוצר: {font.creationDate}</span>
                    <span>•</span>
                    <span>
                      {font.permission === 'public' && '🌐 ציבורי'}
                      {font.permission === 'private' && '🔒 פרטי'}
                      {font.permission === 'specific' && '👥 לאנשים ספציפיים'}
                    </span>
                  </div>
                </div>

                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <Link to={`/fonts/${font.id}`} style={{ padding:'0.6rem 1.2rem', background:'#333', color:'white', textDecoration:'none', borderRadius:'6px', fontSize:'0.9rem', fontWeight:'500', whiteSpace:'nowrap' }}>צפייה</Link>
                  <button onClick={() => handleOpenPermissions(font)} style={{ padding:'0.6rem 1.2rem', background:'white', color:'#333', border:'1px solid #ccc', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem', fontWeight:'500', whiteSpace:'nowrap' }}>הרשאות</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permissions Modal */}
      {showPermissionsModal && selectedFont && (
        <PermissionsModal
          font={selectedFont}
          onSave={handleSavePermissions}
          onCancel={() => setShowPermissionsModal(false)}
        />
      )}
    </div>
  )
}
