// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { downloadFont } from '../features/fonts/services/fontService'; 

// export default function FontDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [font, setFont] = useState(null);
//   const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog');
//   const [isLoading, setIsLoading] = useState(true);
//   const [fontLoaded, setFontLoaded] = useState(false);
  
//   // States לשדרוג ה-Preview
//   const [fontSize, setFontSize] = useState(32);
//   const [isBold, setIsBold] = useState(false);
//   const [fontColor, setFontColor] = useState('#2c3e50');

//   useEffect(() => {
//     const fetchFontDetails = async () => {
//       try {
//         const token = localStorage.getItem('token');
        
//         const response = await fetch('/api/users/me', {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });
//         const data = await response.json();
//         const foundFont = data.fonts.find(f => f.id === parseInt(id));

//         if (!foundFont) throw new Error('Font not found');
//         setFont(foundFont);

//         const fontRes = await fetch(`/api/fonts/download/${id}`, {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });

//         if (!fontRes.ok) throw new Error('Failed to fetch font file');

//         const fontBlob = await fontRes.blob();
//         const fontUrl = URL.createObjectURL(fontBlob);
        
//         const fontFace = new FontFace(`CustomFont_${id}`, `url(${fontUrl})`);
        
//         await fontFace.load();
//         document.fonts.add(fontFace);
        
//         setFontLoaded(true);
//         setIsLoading(false);
//       } catch (err) {
//         console.error("Font loading error:", err);
//         setIsLoading(false);
//       }
//     };

//     fetchFontDetails();
//   }, [id]);

//   const handleDownloadClick = async () => {
//     try {
//       await downloadFont(font.id, font.fontName);
//     } catch (err) {
//       alert("שגיאה בהורדה");
//     }
//   };

//   if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>טוען...</div>;
//   if (!font) return <div style={{ padding: '3rem', textAlign: 'center' }}>הפונט לא נמצא.</div>;

//   return (
//     <div style={{ direction: 'rtl', textAlign: 'right', padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
//       <button 
//         onClick={() => navigate('/dashboard')}
//         style={{ marginBottom: '1.5rem', background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}
//       >
//         <span>→</span> חזרה לאזור האישי
//       </button>

//       <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e0e0e0', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        
//         {/* Header */}
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '2px solid #f8f9fa', paddingBottom: '1.5rem' }}>
//           <div>
//             <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '2.2rem' }}>{font.fontName}</h1>

//           </div>
//           <button 
//             onClick={handleDownloadClick}
//             style={{ padding: '0.9rem 2rem', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: 'transform 0.2s' }}
//             onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
//             onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
//           >
//             הורד פונט (TTF)
//           </button>
//         </div>

//         {/* Toolbar - סרגל הכלים החדש */}
//         <div style={{ 
//             display: 'flex', 
//             flexWrap: 'wrap',
//             alignItems: 'center', 
//             gap: '1.5rem', 
//             marginBottom: '1rem', 
//             padding: '1.2rem', 
//             background: '#f8f9fa', 
//             borderRadius: '12px',
//             border: '1px solid #eee'
//         }}>
//           {/* גודל פונט */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px' }}>
//             <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>גודל:</span>
//             <input 
//               type="range" min="20" max="150" value={fontSize} 
//               onChange={(e) => setFontSize(e.target.value)} 
//               style={{ flex: 1, cursor: 'pointer', accentColor: '#2c3e50' }}
//             />
//             <span style={{ fontSize: '0.9rem', width: '45px', textAlign: 'center', background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>{fontSize}px</span>
//           </div>

//           {/* בולד וצבע */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
//             <button 
//               onClick={() => setIsBold(!isBold)}
//               style={{
//                 width: '40px', height: '40px', background: isBold ? '#2c3e50' : 'white',
//                 color: isBold ? 'white' : '#2c3e50', border: '2px solid #2c3e50',
//                 borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem'
//               }}
//               title="הדגשה"
//             >B</button>
            
//             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>צבע:</span>
//                 <input 
//                     type="color" value={fontColor} 
//                     onChange={(e) => setFontColor(e.target.value)}
//                     style={{ border: 'none', width: '40px', height: '40px', cursor: 'pointer', background: 'none' }}
//                 />
//             </div>

//             <button 
//                 onClick={() => setPreviewText('')}
//                 style={{ background: '#fff', border: '1px solid #ccc', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}
//             >
//                 נקה טקסט
//             </button>
//           </div>
//         </div>

//         {/* Preview Area */}
//         <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
//           <textarea 
//             value={previewText}
//             onChange={(e) => setPreviewText(e.target.value)}
//             placeholder="Type something in English..."
//             style={{ 
//               width: '100%', 
//               minHeight: '250px', 
//               padding: '2rem', 
//               fontSize: `${fontSize}px`, 
//               color: fontColor,
//               fontWeight: isBold ? 'bold' : 'normal',
//               fontFamily: fontLoaded ? `CustomFont_${id}` : 'serif', 
//               border: '2px solid #f0f0f0', 
//               borderRadius: '12px',
//               outline: 'none',
//               lineHeight: '1.3',
//               direction: 'ltr', // כיוון אנגלי
//               textAlign: 'left', // הצמדה לשמאל
//               resize: 'vertical',
//               boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
//               transition: 'border-color 0.3s'
//             }}
//             onFocus={(e) => e.target.style.borderColor = '#3498db'}
//             onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
//           />
//           {!fontLoaded && (
//             <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#e67e22', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>
//                 טוען פונט...
//             </div>
//           )}
//         </div>

//         {/* AI Style Tags */}
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', borderTop: '2px solid #f8f9fa', paddingTop: '2rem' }}>
//             <div style={{ textAlign: 'center', padding: '15px', background: '#fcfcfc', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
//                 <small style={{ color: '#95a5a6', display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>סגנון גיאומטרי</small>
//                 <strong style={{ color: '#2c3e50', fontSize: '1.1rem' }}>{font.geometricStyle?.name || font.geometricStyle || 'לא זוהה'}</strong>
//             </div>
//             <div style={{ textAlign: 'center', padding: '15px', background: '#fcfcfc', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
//                 <small style={{ color: '#95a5a6', display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>סגנון תוכן</small>
//                 <strong style={{ color: '#2c3e50', fontSize: '1.1rem' }}>{font.contentStyle?.name || font.contentStyle || 'לא זוהה'}</strong>
//             </div>
//             <div style={{ textAlign: 'center', padding: '15px', background: '#fcfcfc', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
//                 <small style={{ color: '#95a5a6', display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>סגנון הבעה</small>
//                 <strong style={{ color: '#2c3e50', fontSize: '1.1rem' }}>{font.expressionStyle?.name || font.expressionStyle || 'לא זוהה'}</strong>
//             </div>
//         </div>
//       </div>
//     </div>
//   )
// }

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { downloadFont } from '../features/fonts/services/fontService';
import { ArrowRight, Download, Bold, Eraser } from 'lucide-react';

// ====== ערכת העיצוב (Hand2Font) ======
const T = {
  paper: '#FAF7F1', surface: '#FFFFFF', ink: '#241C15', inkSoft: '#736A5E', inkFaint: '#A79E90',
  hair: '#EBE4D7', hairStrong: '#DDD4C3', orange: '#E8741E', orangeSoft: '#FCEFE2',
  indigo: '#3F40C4', indigoSoft: '#ECECFB',
  shadow: '0 1px 2px rgba(36,28,21,.04), 0 8px 30px rgba(36,28,21,.05)',
  fontSans: "'Assistant', sans-serif", fontSerif: "'Frank Ruhl Libre', serif",
};

export default function FontDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [font, setFont] = useState(null);
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog');
  const [isLoading, setIsLoading] = useState(true);
  const [fontLoaded, setFontLoaded] = useState(false);

  // States לשדרוג ה-Preview
  const [fontSize, setFontSize] = useState(44);
  const [isBold, setIsBold] = useState(false);
  const [fontColor, setFontColor] = useState('#241C15');

  useEffect(() => {
    // טעינת גופני המערכת (פעם אחת)
    if (!document.getElementById('h2f-fonts')) {
      const link = document.createElement('link');
      link.id = 'h2f-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&family=Frank+Ruhl+Libre:wght@400;500;700&display=swap';
      document.head.appendChild(link);
    }

    const fetchFontDetails = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const foundFont = data.fonts.find(f => f.id === parseInt(id));

        if (!foundFont) throw new Error('Font not found');
        setFont(foundFont);

        const fontRes = await fetch(`/api/fonts/download/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!fontRes.ok) throw new Error('Failed to fetch font file');

        const fontBlob = await fontRes.blob();
        const fontUrl = URL.createObjectURL(fontBlob);

        const fontFace = new FontFace(`CustomFont_${id}`, `url(${fontUrl})`);

        await fontFace.load();
        document.fonts.add(fontFace);

        setFontLoaded(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Font loading error:", err);
        setIsLoading(false);
      }
    };

    fetchFontDetails();
  }, [id]);

  const handleDownloadClick = async () => {
    try {
      await downloadFont(font.id, font.fontName);
    } catch (err) {
      alert("שגיאה בהורדה");
    }
  };

  if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center', fontFamily: T.fontSans, color: T.inkSoft }}>טוען...</div>;
  if (!font) return <div style={{ padding: '3rem', textAlign: 'center', fontFamily: T.fontSans }}>הפונט לא נמצא.</div>;

  return (
    <div style={{ direction: 'rtl', textAlign: 'right', padding: '1.5rem', maxWidth: '1000px', margin: '0 auto', fontFamily: T.fontSans, color: T.ink }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: '1.5rem', background: 'none', border: 'none', color: T.indigo, cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: T.fontSans, fontWeight: 600 }}
      >
        <ArrowRight size={18} /> חזרה לאזור האישי
      </button>

      <div style={{ background: T.surface, borderRadius: '18px', border: `1px solid ${T.hair}`, padding: '2.25rem 2.4rem', boxShadow: T.shadow }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', borderBottom: `1px solid ${T.hair}`, paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: T.fontSerif, fontWeight: 500, color: T.ink, fontSize: '2rem' }}>{font.fontName}</h1>
            <div style={{ fontSize: '0.85rem', color: T.inkFaint, marginTop: '4px' }}>
              {font.creationDate && <>נוצר {font.creationDate} · </>}{font.downloadCount || 0} הורדות
            </div>
          </div>
          <button
            onClick={handleDownloadClick}
            style={{ padding: '0.85rem 1.6rem', background: T.ink, color: '#F3ECE0', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', fontFamily: T.fontSans, display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Download size={18} /> הורדת פונט (TTF)
          </button>
        </div>

        {/* Toolbar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem',
          marginBottom: '1.25rem', padding: '1rem 1.2rem', background: '#FCFAF6',
          borderRadius: '10px', border: `1px solid ${T.hair}`,
        }}>
          {/* גודל */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px' }}>
            <span style={{ fontSize: '0.9rem', color: T.inkSoft, fontWeight: 600 }}>גודל:</span>
            <input
              type="range" min="20" max="120" value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              style={{ flex: 1, cursor: 'pointer', accentColor: T.orange }}
            />
            <span style={{ fontSize: '0.85rem', width: '52px', textAlign: 'center', background: '#fff', border: `1px solid ${T.hairStrong}`, padding: '3px 6px', borderRadius: '6px', color: T.ink }}>{fontSize}px</span>
          </div>

          {/* בולד + צבע + ניקוי */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setIsBold(!isBold)}
              title="הדגשה"
              style={{
                width: '40px', height: '40px', background: isBold ? T.ink : '#fff',
                color: isBold ? '#fff' : T.ink, border: `1.5px solid ${T.ink}`,
                borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            ><Bold size={18} /></button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: T.inkSoft, fontWeight: 600 }}>צבע:</span>
              <input
                type="color" value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                style={{ border: `1px solid ${T.hairStrong}`, width: '40px', height: '40px', cursor: 'pointer', background: 'none', borderRadius: '8px', padding: '2px' }}
              />
            </div>

            <button
              onClick={() => setPreviewText('')}
              style={{ background: '#fff', border: `1px solid ${T.hairStrong}`, padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontFamily: T.fontSans, color: T.ink, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Eraser size={16} /> נקה טקסט
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div style={{ marginBottom: '2rem', position: 'relative' }}>
          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Type something in English..."
            style={{
              width: '100%', minHeight: '230px', padding: '2rem',
              fontSize: `${fontSize}px`, color: fontColor,
              fontWeight: isBold ? 'bold' : 'normal',
              fontFamily: fontLoaded ? `CustomFont_${id}` : 'serif',
              border: `1px solid ${T.hair}`, borderRadius: '14px', outline: 'none',
              lineHeight: 1.3, direction: 'ltr', textAlign: 'left', resize: 'vertical',
              background: '#FCFAF6', transition: 'border-color 0.3s',
            }}
            onFocus={(e) => e.target.style.borderColor = T.orange}
            onBlur={(e) => e.target.style.borderColor = T.hair}
          />
          {!fontLoaded && (
            <div style={{ position: 'absolute', top: '12px', right: '12px', background: T.orange, color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
              טוען פונט...
            </div>
          )}
        </div>

        {/* AI Style Tags */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', borderTop: `1px solid ${T.hair}`, paddingTop: '1.75rem' }}>
          <StyleTag label="סגנון גיאומטרי" value={font.geometricStyle?.name || font.geometricStyle || 'לא זוהה'} />
          <StyleTag label="סגנון תוכן" value={font.contentStyle?.name || font.contentStyle || 'לא זוהה'} />
          <StyleTag label="סגנון הבעה" value={font.expressionStyle?.name || font.expressionStyle || 'לא זוהה'} />
        </div>
      </div>
    </div>
  )
}

function StyleTag({ label, value }) {
  return (
    <div style={{ textAlign: 'center', padding: '1.1rem 0.75rem', background: '#FCFAF6', borderRadius: '14px', border: `1px solid ${T.hair}` }}>
      <small style={{ color: T.inkFaint, display: 'block', marginBottom: '6px', fontSize: '0.8rem', letterSpacing: '.3px' }}>{label}</small>
      <strong style={{ color: T.ink, fontSize: '1rem', fontWeight: 600 }}>{value}</strong>
    </div>
  )
}
