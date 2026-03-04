import { useState, useEffect } from 'react'

export default function PermissionsModal({ font, onSave, onCancel }) {
  const [permissions, setPermissions] = useState({
    permission: '', // הרשאה נוכחית: 'public', 'private', 'specific'
    allowedViewEmails: []
  })
  const [newEmail, setNewEmail] = useState('')

  // סנכרון עם הפונט שנבחר
  useEffect(() => {
    if (font) {
      setPermissions({
        permission: font.permission, // זו ההרשאה מהטבלה
        allowedViewEmails: font.allowedViewEmails || []
      })
    }
  }, [font])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(font.id, permissions)
  }

  const addEmail = () => {
    if (newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      if (!permissions.allowedViewEmails.includes(newEmail)) {
        setPermissions(prev => ({
          ...prev,
          allowedViewEmails: [...prev.allowedViewEmails, newEmail]
        }))
        setNewEmail('')
      }
    } else {
      alert('אנא הזן אימייל תקין')
    }
  }

  const removeEmail = (email) => {
    setPermissions(prev => ({
      ...prev,
      allowedViewEmails: prev.allowedViewEmails.filter(e => e !== email)
    }))
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%'
      }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', fontWeight: '600' }}>
          ניהול הרשאות - {font.name}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* הרשאות צפייה */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4>מי יכול לצפות בפונט?</h4>
           {['public', 'private', 'specific'].map(option => (
           <label key={option} style={{
             display: 'flex',
             alignItems: 'center',
             gap: '0.5rem',
             padding: '0.5rem',
             border: permissions.permission === option ? '2px solid #333' : '1px solid #ccc',
             borderRadius: '6px',
             cursor: 'pointer',
             background: permissions.permission === option ? '#f5f5f5' : 'white',
             marginBottom: '1.5rem' 
           }}>
             <input
               type="radio"
               name="permission"
               value={option}
               checked={permissions.permission === option}
               onChange={e => setPermissions(prev => ({ ...prev, permission: e.target.value }))}
             />
             <span>
               {option === 'public' && '🌐 ציבורי'}
               {option === 'private' && '🔒 פרטי'}
               {option === 'specific' && '👥 אנשים ספציפיים'}
             </span>
           </label>
            ))}
          </div>

          {/* אם ספציפי, להציג אימיילים */}
          {permissions.permission === 'specific' && (
            <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '6px', background: '#fafafa' }}>
              <h5>מי יכול לראות?</h5>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="הזן אימייל"
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button type="button" onClick={addEmail} style={{ padding: '0.5rem 1rem', background: '#333', color: 'white', borderRadius: '4px' }}>הוסף</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {permissions.allowedViewEmails.map((email, i) => (
                  <div key={i} style={{ padding: '0.3rem 0.6rem', background: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {email} <button type="button" onClick={() => removeEmail(email)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* כפתורים */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={onCancel} style={{ padding: '0.7rem 1.2rem', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }}>ביטול</button>
            <button type="submit" style={{ padding: '0.7rem 1.2rem', borderRadius: '6px', background: '#333', color: 'white' }}>שמור שינויים</button>
          </div>
        </form>
      </div>
    </div>
  )
}
