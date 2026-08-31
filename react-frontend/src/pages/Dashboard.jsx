
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PermissionsModal from '../features/fonts/components/PermissionsModal'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import { Trash2, Loader2, Lock, Globe, Users, Plus } from 'lucide-react'

// ====== ערכת העיצוב (Hand2Font) ======
const T = {
  paper: '#FAF7F1', surface: '#FFFFFF', ink: '#241C15', inkSoft: '#736A5E', inkFaint: '#A79E90',
  hair: '#EBE4D7', hairStrong: '#DDD4C3', orange: '#E8741E', orangeSoft: '#FCEFE2',
  indigo: '#3F40C4', indigoSoft: '#ECECFB',
  shadow: '0 1px 2px rgba(36,28,21,.04), 0 8px 30px rgba(36,28,21,.05)',
  fontSans: "'Assistant', sans-serif", fontSerif: "'Frank Ruhl Libre', serif", fontHand: "'Gveret Levin', cursive",
}

// --- רכיב שורה בודדת (מנהל סטטוס חי) ---
const FontRowItem = ({ font: initialFont, onOpenPermissions, onDeleteFont }) => {
  const [font, setFont] = useState(initialFont);
  const isProcessing = font.status === 'PROCESSING' || font.status === 'PENDING';
  const isFailed = font.status === 'FAILED';

  useEffect(() => {
    if (isProcessing) {
      const socket = new SockJS('/api/ws-font-status');
      const stompClient = Stomp.over(socket);
      stompClient.debug = null;

      stompClient.connect({}, () => {
        stompClient.subscribe(`/topic/status/${font.id}`, (msg) => {
          const newStatus = msg.body;
          setFont(prev => ({ ...prev, status: newStatus }));
          if (newStatus === 'COMPLETED' || newStatus === 'FAILED') {
            stompClient.disconnect();
          }
        });
      }, () => console.error("WS Connection Error"));

      return () => { if (stompClient && stompClient.connected) stompClient.disconnect(); };
    }
  }, [font.id, isProcessing]);

  const permBadge = () => {
    if (font.permission === 'PUBLIC') return <><Globe size={13} /> ציבורי</>
    if (font.permission === 'RESTRICTED') return <><Users size={13} /> מוגבל</>
    return <><Lock size={13} /> פרטי</>
  }

  return (
    <div style={styles.rowContainer}>
      {isProcessing && (
        <div style={styles.rowOverlay}>
          <Loader2 size={18} className="h2f-spin" style={{ color: T.indigo, marginLeft: '8px' }} />
          <span style={styles.overlayText}>בונה את הפונט…</span>
        </div>
      )}

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '1rem',
        filter: isProcessing ? 'blur(4px)' : 'none',
        opacity: isProcessing ? 0.6 : 1,
        transition: 'all 0.4s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={styles.fontTitle}>{font.fontName}</h3>
            <div style={styles.fontDetails}>
              <span>{font.downloadCount || 0} הורדות</span>
              <span>·</span>
              <span>נוצר {font.creationDate}</span>
              <span>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>{permBadge()}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isProcessing && !isFailed && (
            <>
              <Link to={`/fonts/${font.id}`} style={styles.viewBtn}>צפייה</Link>
              <button onClick={() => onOpenPermissions(font)} style={styles.permBtn}>הרשאות</button>
            </>
          )}

          {isFailed && <span style={{ color: '#c0492b', fontSize: '0.85rem', fontWeight: 600 }}>נכשל</span>}

          <button
            onClick={() => !isProcessing && onDeleteFont(font.id)}
            disabled={isProcessing}
            style={{
              ...styles.deleteBtn,
              opacity: isProcessing ? 0.3 : 1,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
            }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- הקומפוננטה הראשית: Dashboard ---
export default function Dashboard() {
  const [userData, setUserData] = useState(null)
  const [myFonts, setMyFonts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedUserData, setEditedUserData] = useState({})
  const [selectedFont, setSelectedFont] = useState(null)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)

  useEffect(() => {
    loadDashboardData();
    if (typeof document !== 'undefined') {
      if (!document.getElementById('h2f-fonts')) {
        const link = document.createElement('link')
        link.id = 'h2f-fonts'
        link.rel = 'stylesheet'
        link.href = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&family=Frank+Ruhl+Libre:wght@400;500;700&family=Gveret+Levin&display=swap'
        document.head.appendChild(link)
      }
      if (!document.getElementById('h2f-dash-anim')) {
        const style = document.createElement('style');
        style.id = 'h2f-dash-anim'
        style.textContent = `@keyframes h2f-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .h2f-spin { animation: h2f-spin 2s linear infinite; }`;
        document.head.appendChild(style);
      }
    }
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setUserData(data.user); setEditedUserData(data.user); setMyFonts(data.fonts);
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  }

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editedUserData)
      })
      if (response.ok) {
        const updated = await response.json();
        setUserData(updated); setIsEditingProfile(false);
        alert('הפרטים עודכנו');
      }
    } catch (e) { alert('שגיאה בעדכון'); }
  }

  const handleDeleteFont = async (fontId) => {
    if (!window.confirm("למחוק את הפונט?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/fonts/${fontId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setMyFonts(prev => prev.filter(f => f.id !== fontId));
    } catch (e) { alert("שגיאה במחיקה"); }
  }

  const handleSavePermissions = async (fontId, permissions) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/fonts/${fontId}/permissions`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission: permissions.permission, allowedEmails: permissions.allowedViewEmails })
      });
      setMyFonts(prev => prev.map(f => f.id === fontId ? { ...f, ...permissions } : f));
      setShowPermissionsModal(false);
    } catch (e) { console.error(e); }
  }

  if (isLoading) return <div style={styles.loadingScreen}>טוען...</div>

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.header}>
        <h1 style={styles.mainTitle}>אזור אישי</h1>
        <Link to="/create" style={styles.createBtn}><Plus size={17} /> פונט חדש</Link>
      </div>

      {/* כרטיס פרופיל */}
      <div style={styles.profileCard}>
        <div style={styles.profileHeader}>
          <h2 style={styles.sectionTitle}>פרטי חשבון</h2>
          {!isEditingProfile ? (
            <button onClick={() => setIsEditingProfile(true)} style={styles.editBtn}>ערוך</button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSaveProfile} style={styles.saveBtn}>שמור</button>
              <button onClick={() => setIsEditingProfile(false)} style={styles.cancelBtn}>ביטול</button>
            </div>
          )}
        </div>
        <div style={styles.profileGrid}>
          <div>
            <label style={styles.label}>שם מלא</label>
            {isEditingProfile ? (
              <input type="text" value={editedUserData.fullName} onChange={(e) => setEditedUserData(prev => ({ ...prev, fullName: e.target.value }))} style={styles.input} />
            ) : <div style={styles.staticValue}>{userData?.fullName}</div>}
          </div>
          <div>
            <label style={styles.label}>אימייל</label>
            <div style={styles.disabledInput}>{userData?.email}</div>
          </div>
        </div>
      </div>

      {/* רשימת פונטים */}
      <div>
        <h2 style={styles.sectionTitle}>הפונטים שלי ({myFonts.length})</h2>
        <div style={{ marginTop: '1.5rem' }}>
          {myFonts.length === 0 ? (
            <div style={styles.emptyState}>עדיין לא יצרתם פונטים.</div>
          ) : (
            myFonts.map(font => (
              <FontRowItem
                key={font.id}
                font={font}
                onOpenPermissions={(f) => { setSelectedFont(f); setShowPermissionsModal(true); }}
                onDeleteFont={handleDeleteFont}
              />
            ))
          )}
        </div>
      </div>

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

// --- סגנונות (Styles) ---
const styles = {
  pageWrapper: { padding: '2.5rem 1.5rem', maxWidth: '1000px', margin: '0 auto', direction: 'rtl', fontFamily: T.fontSans, color: T.ink },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: `1px solid ${T.hair}`, paddingBottom: '1.5rem' },
  mainTitle: { fontFamily: T.fontSerif, fontSize: '2rem', fontWeight: 500, letterSpacing: '-.5px' },
  createBtn: { padding: '0.7rem 1.3rem', background: T.orange, color: '#fff', textDecoration: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' },
  profileCard: { background: T.surface, padding: '2rem', borderRadius: '14px', marginBottom: '3rem', border: `1px solid ${T.hair}`, boxShadow: '0 1px 2px rgba(36,28,21,.04)' },
  profileHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  sectionTitle: { fontFamily: T.fontSerif, fontSize: '1.3rem', fontWeight: 500, color: T.ink },
  editBtn: { padding: '0.5rem 1rem', background: '#fff', border: `1px solid ${T.hairStrong}`, borderRadius: '8px', cursor: 'pointer', fontFamily: T.fontSans, fontWeight: 600, color: T.ink },
  saveBtn: { padding: '0.5rem 1rem', background: T.ink, color: '#F3ECE0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: T.fontSans, fontWeight: 600 },
  cancelBtn: { padding: '0.5rem 1rem', background: '#fff', border: `1px solid ${T.hairStrong}`, borderRadius: '8px', cursor: 'pointer', fontFamily: T.fontSans, color: T.ink },
  profileGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' },
  label: { display: 'block', marginBottom: '0.4rem', color: T.inkSoft, fontSize: '0.85rem', fontWeight: 600 },
  input: { width: '100%', padding: '0.7rem', border: `1px solid ${T.hairStrong}`, borderRadius: '8px', fontSize: '1rem', fontFamily: T.fontSans, background: '#FCFAF6', color: T.ink },
  staticValue: { fontSize: '1rem', color: T.ink, padding: '0.7rem 0' },
  disabledInput: { color: T.inkFaint, padding: '0.7rem 0' },
  loadingScreen: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', fontSize: '1.1rem', color: T.inkSoft, fontFamily: T.fontSans },
  emptyState: { textAlign: 'center', padding: '3rem', color: T.inkFaint, background: '#FCFAF6', borderRadius: '14px', border: `1px solid ${T.hair}` },

  rowContainer: { position: 'relative', background: T.surface, padding: '1.1rem 1.4rem', borderRadius: '14px', border: `1px solid ${T.hair}`, display: 'flex', alignItems: 'center', marginBottom: '1rem', overflow: 'hidden', transition: '.2s' },
  rowOverlay: { position: 'absolute', inset: 0, background: 'rgba(250,247,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, backdropFilter: 'blur(1px)' },
  overlayText: { fontWeight: 600, fontSize: '0.85rem', color: T.indigo },
  mini: { width: '46px', height: '46px', borderRadius: '10px', background: '#FCFAF6', border: `1px solid ${T.hair}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.fontHand, fontSize: '24px', color: T.ink, flexShrink: 0 },
  fontTitle: { fontSize: '1.05rem', margin: '0 0 3px 0', color: T.ink, fontWeight: 600 },
  fontDetails: { fontSize: '0.8rem', color: T.inkFaint, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  viewBtn: { padding: '0.5rem 1rem', background: T.ink, color: '#F3ECE0', textDecoration: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 },
  permBtn: { padding: '0.5rem 1rem', background: '#fff', border: `1px solid ${T.hairStrong}`, borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: T.fontSans, fontWeight: 600, color: T.ink },
  deleteBtn: { width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0492b', background: '#fff', border: '1px solid #F0D6CC', borderRadius: '8px', transition: 'all 0.2s', padding: 0 },
}
