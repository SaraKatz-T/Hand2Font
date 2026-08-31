
import { useState, useEffect } from 'react'
import { Lock, Globe, Users, X } from 'lucide-react'

// ====== ערכת העיצוב (Hand2Font) ======
const T = {
  surface: '#FFFFFF', ink: '#241C15', inkSoft: '#736A5E', inkFaint: '#A79E90',
  hair: '#EBE4D7', hairStrong: '#DDD4C3', orange: '#E8741E', indigo: '#3F40C4',
  shadow: '0 20px 60px rgba(36,28,21,.25)',
  fontSans: "'Assistant', sans-serif", fontSerif: "'Frank Ruhl Libre', serif",
}

export default function PermissionsModal({ font, onSave, onCancel }) {
  const [permissions, setPermissions] = useState({ permission: '', allowedViewEmails: [] })
  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    if (font) {
      setPermissions({
        permission: font.permission || 'PRIVATE',
        allowedViewEmails: font.allowedViewEmails || []
      })
    }
  }, [font])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(font.id, permissions)
  }

  const addEmail = () => {
    const email = newEmail.trim()
    if (!email) { setEmailError('יש להזין כתובת אימייל'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('כתובת אימייל לא תקינה'); return; }
    if (permissions.allowedViewEmails.includes(email)) { setEmailError('האימייל כבר ברשימה'); return; }
    setPermissions(prev => ({ ...prev, allowedViewEmails: [...prev.allowedViewEmails, email] }))
    setNewEmail(''); setEmailError('');
  }

  const removeEmail = (email) => {
    setPermissions(prev => ({ ...prev, allowedViewEmails: prev.allowedViewEmails.filter(e => e !== email) }))
  }

  const options = [
    { val: 'PUBLIC', icon: <Globe size={18} />, label: 'ציבורי', desc: 'גלוי לכולם בספרייה' },
    { val: 'PRIVATE', icon: <Lock size={18} />, label: 'פרטי', desc: 'רק אתם רואים' },
    { val: 'RESTRICTED', icon: <Users size={18} />, label: 'אנשים ספציפיים', desc: 'רק כתובות שתבחרו' },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(36,28,21,0.45)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      direction: 'rtl', fontFamily: T.fontSans, padding: '1rem',
    }}>
      <div style={{ background: T.surface, padding: '2rem', borderRadius: '18px', maxWidth: '500px', width: '100%', boxShadow: T.shadow, color: T.ink }}>
        <h3 style={{ fontFamily: T.fontSerif, fontSize: '1.4rem', marginBottom: '0.3rem', fontWeight: 500 }}>
          ניהול הרשאות
        </h3>
        <p style={{ color: T.inkSoft, fontSize: '0.9rem', marginBottom: '1.6rem' }}>
          {font.fontName || font.name}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.8rem' }}>מי יכול לצפות בפונט?</h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              {options.map(opt => {
                const active = permissions.permission === opt.val
                return (
                  <label key={opt.val} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '0.85rem 1rem',
                    border: `1px solid ${active ? T.ink : T.hairStrong}`, borderRadius: '12px', cursor: 'pointer',
                    background: active ? '#FCFAF6' : '#fff', transition: '.2s',
                  }}>
                    <input type="radio" name="permission" value={opt.val} checked={active}
                      onChange={e => setPermissions(prev => ({ ...prev, permission: e.target.value }))}
                      style={{ accentColor: T.orange, width: '17px', height: '17px' }} />
                    <span style={{ color: active ? T.ink : T.inkSoft, display: 'flex' }}>{opt.icon}</span>
                    <span style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', display: 'block' }}>{opt.label}</span>
                      <span style={{ fontSize: '0.8rem', color: T.inkFaint }}>{opt.desc}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {permissions.permission === 'RESTRICTED' && (
            <div style={{ marginBottom: '1.2rem', padding: '1rem', border: `1px solid ${T.hair}`, borderRadius: '12px', background: '#FCFAF6' }}>
              <h5 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.7rem' }}>מי יכול לראות?</h5>
              <div style={{ display: 'flex', gap: '6px', marginBottom: emailError ? '6px' : '0.7rem' }}>
                <input type="email" value={newEmail}
                  onChange={e => { setNewEmail(e.target.value); if (emailError) setEmailError(''); }}
                  placeholder="הזינו אימייל"
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                  style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '10px', border: `1px solid ${emailError ? '#c0492b' : T.hairStrong}`, fontFamily: T.fontSans, background: '#fff', color: T.ink, outline: 'none' }} />
                <button type="button" onClick={addEmail}
                  style={{ padding: '0.6rem 1.1rem', background: T.ink, color: '#F3ECE0', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: T.fontSans, fontWeight: 600 }}>
                  הוסף
                </button>
              </div>
              {emailError && <div style={{ color: '#c0492b', fontSize: '0.82rem', marginBottom: '0.7rem' }}>{emailError}</div>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {permissions.allowedViewEmails.map((email, i) => (
                  <div key={i} style={{ padding: '0.35rem 0.7rem', background: '#fff', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid ${T.hair}`, fontSize: '0.82rem' }}>
                    {email}
                    <X size={14} style={{ cursor: 'pointer', color: '#c0492b' }} onClick={() => removeEmail(email)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onCancel}
              style={{ padding: '0.7rem 1.3rem', borderRadius: '10px', border: `1px solid ${T.hairStrong}`, background: '#fff', cursor: 'pointer', fontFamily: T.fontSans, fontWeight: 600, color: T.ink }}>
              ביטול
            </button>
            <button type="submit"
              style={{ padding: '0.7rem 1.3rem', borderRadius: '10px', background: T.orange, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: T.fontSans, fontWeight: 600 }}>
              שמירת שינויים
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
