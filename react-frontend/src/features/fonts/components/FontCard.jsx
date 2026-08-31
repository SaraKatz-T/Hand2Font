
// export default FontCard
import React, { useState, useEffect } from 'react'
import { downloadFont } from '../services/fontService'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import { Download, Loader2, XCircle, User } from 'lucide-react'

// ====== ערכת העיצוב (Hand2Font) ======
const T = {
  surface: '#FFFFFF', ink: '#241C15', inkSoft: '#736A5E', inkFaint: '#A79E90',
  hair: '#EBE4D7', hairStrong: '#DDD4C3', orange: '#E8741E', orangeSoft: '#FCEFE2',
  indigo: '#3F40C4', indigoSoft: '#ECECFB',
  fontSans: "'Assistant', sans-serif", fontHand: "'Gveret Levin', cursive",
}

// הזרקת אנימציות (סיבוב + נצנוץ הצלחה) + טעינת גופנים
if (typeof document !== 'undefined') {
  if (!document.getElementById('h2f-fontcard-anim')) {
    const style = document.createElement('style');
    style.id = 'h2f-fontcard-anim';
    style.textContent = `
      @keyframes h2f-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes h2f-success-glow {
        0% { box-shadow: 0 0 0px rgba(63,64,196,0); }
        50% { box-shadow: 0 0 22px rgba(63,64,196,0.45); border-color: #3F40C4; }
        100% { box-shadow: 0 0 0px rgba(63,64,196,0); }
      }
      .h2f-animate-success { animation: h2f-success-glow 1.5s ease-out; }
      .h2f-spin { animation: h2f-spin 2s linear infinite; }
      .h2f-tag { transition: background-color .2s ease, border-color .2s ease; }
      .h2f-tag:hover { background-color: #F3EEE3; border-color: #CFC4AE; }
    `;
    document.head.appendChild(style);
  }
  if (!document.getElementById('h2f-fonts')) {
    const link = document.createElement('link');
    link.id = 'h2f-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&family=Frank+Ruhl+Libre:wght@400;500;700&family=Gveret+Levin&display=swap';
    document.head.appendChild(link);
  }
}

const FontCard = ({ font: initialFont }) => {
  const [font, setFont] = useState(initialFont);
  const [justFinished, setJustFinished] = useState(false);

  const isProcessing = font.status === 'PENDING' || font.status === 'PROCESSING';
  const isFailed = font.status === 'FAILED';

  useEffect(() => {
    if (isProcessing) {
      const socket = new SockJS('/api/ws-font-status');
      const stompClient = Stomp.over(socket);
      stompClient.debug = null;

      stompClient.connect({}, () => {
        stompClient.subscribe(`/topic/status/${font.id}`, (msg) => {
          const newStatus = msg.body;

          if (newStatus === 'COMPLETED') {
            setJustFinished(true);
            setTimeout(() => setJustFinished(false), 2000);
          }

          setFont(prev => ({ ...prev, status: newStatus }));

          if (newStatus === 'COMPLETED' || newStatus === 'FAILED') {
            stompClient.disconnect();
          }
        });
      });

      return () => { if (stompClient.connected) stompClient.disconnect(); };
    }
  }, [font.id, isProcessing]);

  return (
    <div
      style={{
        ...styles.card,
        ...(isFailed ? styles.failedCard : {}),
        ...(justFinished ? { border: `2px solid ${T.indigo}` } : {}),
      }}
      className={justFinished ? 'h2f-animate-success' : ''}
    >
      {/* שכבת עיבוד */}
      {isProcessing && (
        <div style={styles.overlay}>
          <Loader2 size={30} className="h2f-spin" style={{ color: T.indigo, marginBottom: '10px' }} />
          <div style={styles.overlayText}>בונה את הפונט…</div>
        </div>
      )}

      <div style={{
        filter: isProcessing ? 'blur(4px)' : 'none',
        transition: 'filter 0.4s ease',
        opacity: isProcessing ? 0.7 : 1,
        padding: '24px 22px 22px',
        textAlign: 'center',
      }}>
        <h3 style={styles.title}>{font.fontName}</h3>
        <p style={styles.author}><User size={13} style={{ opacity: 0.7 }} /> {font.ownerName}</p>

        <div style={styles.tags}>
          {font.geometricStyle && <span className="h2f-tag" style={styles.tag}>{font.geometricStyle}</span>}
          {font.contentStyle && <span className="h2f-tag" style={styles.tag}>{font.contentStyle}</span>}
          {font.expressionStyle && <span className="h2f-tag" style={styles.tag}>{font.expressionStyle}</span>}
        </div>

        {isFailed ? (
          <div style={styles.errorText}><XCircle size={16} /> העיבוד נכשל</div>
        ) : (
          <button
            onClick={() => downloadFont(font.id, font.fontName)}
            disabled={isProcessing}
            style={{
              ...styles.button,
              background: isProcessing ? T.hairStrong : T.ink,
              color: isProcessing ? T.inkFaint : '#F3ECE0',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
            }}
            onMouseOver={(e) => { if (!isProcessing) e.currentTarget.style.background = '#000' }}
            onMouseOut={(e) => { if (!isProcessing) e.currentTarget.style.background = T.ink }}
          >
            <Download size={17} /> הורדת פונט
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    position: 'relative', border: `1px solid ${T.hair}`, borderRadius: '16px',
    padding: '0', margin: '0', width: '280px', overflow: 'hidden',
    background: T.surface, textAlign: 'center', transition: 'all 0.3s ease',
    fontFamily: T.fontSans, boxShadow: '0 1px 2px rgba(36,28,21,.04)',
  },
  failedCard: { borderColor: '#F0D6CC', background: '#FFFCFB' },
  overlay: {
    position: 'absolute', inset: 0, background: 'rgba(250,247,241,0.55)',
    backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  overlayText: {
    fontSize: '0.85rem', fontWeight: 600, color: T.indigo,
    background: 'rgba(255,255,255,0.9)', padding: '4px 14px', borderRadius: '20px',
  },
  title: { margin: '0 0 4px', fontSize: '1.2rem', color: T.ink, fontWeight: 700 },
  author: { fontSize: '0.82rem', color: T.inkFaint, marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' },
  tags: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' },
  tag: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '100%', height: '34px', padding: '0 14px', boxSizing: 'border-box',
    borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, lineHeight: 1,
    background: '#FCFAF6', color: T.inkSoft, border: `1px solid ${T.hairStrong}`,
  },
  button: {
    border: 'none', padding: '13px 20px', borderRadius: '10px',
    fontWeight: 600, width: '100%', transition: 'all 0.2s',
    fontFamily: T.fontSans, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
  },
  errorText: { color: '#c0492b', fontWeight: 600, fontSize: '0.9rem', padding: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
}

export default FontCard
