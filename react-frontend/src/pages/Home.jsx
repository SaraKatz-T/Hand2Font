
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { PenLine, Command, Lock } from 'lucide-react'

// ====== ערכת העיצוב (Hand2Font) ======
const T = {
  paper: '#FAF7F1',
  surface: '#FFFFFF',
  ink: '#241C15',
  inkSoft: '#736A5E',
  inkFaint: '#A79E90',
  hair: '#EBE4D7',
  hairStrong: '#DDD4C3',
  orange: '#E8741E',
  orangeSoft: '#FCEFE2',
  indigo: '#3F40C4',
  indigoSoft: '#ECECFB',
  shadow: '0 1px 2px rgba(36,28,21,.04), 0 8px 30px rgba(36,28,21,.05)',
  fontSans: "'Assistant', sans-serif",
  fontSerif: "'Frank Ruhl Libre', serif",
  fontHand: "'Gveret Levin', cursive",
  fontScript: "'Dancing Script', cursive",
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))

    // טעינת הגופנים של Google (פעם אחת)
    if (!document.getElementById('h2f-fonts')) {
      const link = document.createElement('link')
      link.id = 'h2f-fonts'
      link.rel = 'stylesheet'
      link.href =
        'https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&family=Frank+Ruhl+Libre:wght@400;500;700&family=Gveret+Levin&family=Dancing+Script:wght@600;700&display=swap'
      document.head.appendChild(link)
    }
  }, [])

  return (
    <div style={{ fontFamily: T.fontSans, color: T.ink, direction: 'rtl' }}>
      {/* ===== HERO ===== */}
      <section style={{ textAlign: 'center', padding: '5rem 1.5rem 4rem' }}>
        <h1 style={{
          fontFamily: T.fontSerif, fontWeight: 500, letterSpacing: '-1px',
          fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: 1.1, marginBottom: '1.4rem',
        }}>
          כתב היד שלך,<br />
          הופך{' '}
          <span style={{ fontFamily: T.fontScript, fontWeight: 700, color: T.orange, fontSize: '1.12em' }}>
            לגופן
          </span>.
        </h1>

        <p style={{
          fontSize: '1.25rem', color: T.inkSoft, maxWidth: '600px',
          margin: '0 auto 2.3rem', lineHeight: 1.6,
        }}>
          המרה מדויקת ששומרת על האופי, הקצב וחוסר-המושלמות שהופכים את הכתב שלך לשלך באמת.
        </p>

        <div style={{ display: 'flex', gap: '0.9rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!isLoggedIn ? (
            <>
              <Link to="/register" style={btnPrimary}>הירשם עכשיו</Link>
              <Link to="/login" style={btnGhost}>התחבר</Link>
            </>
          ) : (
            <>
              <Link to="/create" style={btnPrimary}>צור פונט</Link>
              <Link to="/dashboard" style={btnGhost}>אזור אישי</Link>
            </>
          )}
        </div>

        {/* דוגמית כתב יד */}
        <div style={{
          margin: '3.5rem auto 0', maxWidth: '760px',
          background: T.surface, border: `1px solid ${T.hair}`, borderRadius: '14px',
          padding: '2.75rem 2rem 2rem', boxShadow: T.shadow, position: 'relative',
        }}>
          <span style={{ ...motifCap, position: 'absolute', top: '16px', right: '22px' }}>דוגמית כתב יד</span>
          <div style={{
            fontFamily: T.fontScript, fontWeight: 600, fontSize: 'clamp(44px, 7vw, 72px)', lineHeight: 1.2,
            color: T.ink, direction: 'ltr',
          }}>
            The quick brown fox
          </div>
          <div style={{
            marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: `1px solid ${T.hair}`,
            textAlign: 'center', fontSize: '0.9rem', color: T.inkSoft,
          }}>
            כל אות נשמרת בדיוק כפי שכתבת אותה
          </div>
        </div>
      </section>

      {/* ===== WHY ===== */}
      <section style={{ padding: '3rem 1.5rem' }}>
        <h2 style={{ fontFamily: T.fontSerif, fontWeight: 500, fontSize: '34px', textAlign: 'center', letterSpacing: '-.5px', marginBottom: '0.5rem' }}>
          {/* dir=ltr כדי שהשם הלועזי לא יתהפך ב-RTL */}
          למה <span dir="ltr" style={{ display: 'inline-flex' }}>
            <span style={{ fontFamily: T.fontScript, fontWeight: 700, color: T.ink }}>Hand</span>
            <span style={{ fontWeight: 700, color: T.orange }}>2</span>
            <span style={{ fontWeight: 700, color: T.indigo }}>Font</span>
          </span>?
        </h2>
        <p style={{ textAlign: 'center', color: T.inkSoft, fontSize: '1rem', maxWidth: '540px', margin: '0 auto 2.75rem' }}>
          לא עוד גנרטור פונטים גנרי — שלוש סיבות שעושות את ההבדל.
        </p>

        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.4rem' }}>
          <FeatureCard icon={<PenLine size={22} />} tint={T.orangeSoft} color={T.orange} title="נאמן לכתב היד"
            text="המנוע לומד את צורת האותיות, השיפוע והמרווחים — ושומר על האופי האישי במקום ליישר אותו." />
          <FeatureCard icon={<Command size={22} />} tint={T.indigoSoft} color={T.indigo} title="פשוט ומהיר"
            text="מעלים תמונה אחת של כתב יד, וממשק נקי מלווה אתכם עד לקובץ TTF מוכן להורדה." />
          <FeatureCard icon={<Lock size={22} />} tint="#F0EDE5" color={T.ink} title="שליטה מלאה"
            text="פרטי, ציבורי או משותף לכתובות נבחרות — הפונטים שלכם, התנאים שלכם." />
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding: '3rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <span style={{ height: '1px', width: '36px', background: T.hairStrong }} />
          <span style={{ fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', color: T.inkSoft, fontWeight: 600 }}>איך זה עובד</span>
          <span style={{ height: '1px', width: '36px', background: T.hairStrong }} />
        </div>

        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <Step n="01" title="העלאת כתב יד" text="העלו תמונה של דף עם האותיות שלכם — חדש או קיים." />
          <Step n="02" title="עיבוד אוטומטי" text="המערכת מעבדת את התמונה ובונה ממנה גופן שלם." />
          <Step n="03" title="הורדה ושימוש" text="מורידים קובץ TTF ומשתמשים בו בכל מסמך, אתר או עיצוב." last />
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: '3rem 1.5rem' }}>
        <div style={{
          maxWidth: '1000px', margin: '0 auto', textAlign: 'center',
          background: T.ink, color: '#F3ECE0', borderRadius: '18px', padding: '3rem 2rem',
        }}>
          <h2 style={{ fontFamily: T.fontSerif, fontWeight: 500, fontSize: '2rem', marginBottom: '0.8rem' }}>
            מוכנים להתחיל?
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.85, marginBottom: '1.8rem' }}>
            כמה דקות מפרידות בין כתב היד שלכם לבין גופן אישי משלכם.
          </p>
          <Link to={isLoggedIn ? '/create' : '/register'} style={{ ...btnPrimary, padding: '15px 36px', fontSize: '16px' }}>
            צור פונט חדש
          </Link>
        </div>
      </section>
    </div>
  )
}

// ====== רכיבי עזר ======
function FeatureCard({ icon, tint, color, title, text }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.hair}`, borderRadius: '14px', padding: '1.9rem 1.75rem' }}>
      <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: tint, color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.1rem' }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: T.fontSerif, fontWeight: 500, fontSize: '21px', marginBottom: '0.5rem', color: T.ink }}>{title}</h3>
      <p style={{ fontSize: '15px', color: T.inkSoft, lineHeight: 1.6 }}>{text}</p>
    </div>
  )
}

function Step({ n, title, text, last }) {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', padding: '1.5rem 0', borderBottom: last ? 'none' : `1px solid ${T.hair}` }}>
      <div style={{ fontFamily: T.fontSerif, fontWeight: 500, fontSize: '34px', color: T.inkFaint, minWidth: '54px', lineHeight: 1 }}>{n}</div>
      <div>
        <h3 style={{ fontSize: '19px', fontWeight: 600, marginBottom: '0.25rem', color: T.ink }}>{title}</h3>
        <p style={{ color: T.inkSoft, fontSize: '15px' }}>{text}</p>
      </div>
    </div>
  )
}

// ====== כפתורים ======
const btnBase = {
  fontFamily: T.fontSans, fontSize: '16px', fontWeight: 600, cursor: 'pointer',
  borderRadius: '10px', padding: '14px 30px', textDecoration: 'none',
  display: 'inline-flex', alignItems: 'center', gap: '8px', transition: '.2s',
}
const btnPrimary = { ...btnBase, background: T.orange, color: '#fff', border: '1px solid transparent' }
const btnGhost = { ...btnBase, background: 'transparent', color: T.ink, border: `1px solid ${T.hairStrong}` }
const motifCap = { fontSize: '12px', letterSpacing: '.5px', color: T.inkFaint, fontWeight: 600 }
