// // import React, { useState, useEffect } from 'react'
// // import { useNavigate } from 'react-router-dom'
// // import { fontService } from '../features/fonts/services/fontService'
// // import SockJS from 'sockjs-client'
// // import Stomp from 'stompjs'

// // // --- פונקציות עזר לניהול IndexedDB (לשמירת התמונה בטיוטה) ---
// // const saveImageToDB = (file) => {
// //   const request = indexedDB.open("FontDraftDB", 1);
// //   request.onupgradeneeded = (e) => {
// //     if (!e.target.result.objectStoreNames.contains("images")) {
// //       e.target.result.createObjectStore("images");
// //     }
// //   };
// //   request.onsuccess = (e) => {
// //     const db = e.target.result;
// //     const tx = db.transaction("images", "readwrite");
// //     tx.objectStore("images").put(file, "draft_image");
// //   };
// // };

// // const getImageFromDB = () => {
// //   return new Promise((resolve) => {
// //     const request = indexedDB.open("FontDraftDB", 1);
// //     request.onsuccess = (e) => {
// //       const db = e.target.result;
// //       if (!db.objectStoreNames.contains("images")) return resolve(null);
// //       const tx = db.transaction("images", "readonly");
// //       const getReq = tx.objectStore("images").get("draft_image");
// //       getReq.onsuccess = () => resolve(getReq.result);
// //     };
// //     request.onupgradeneeded = (e) => e.target.result.createObjectStore("images");
// //   });
// // };

// // const clearImageFromDB = () => {
// //   const request = indexedDB.open("FontDraftDB", 1);
// //   request.onsuccess = (e) => {
// //     const db = e.target.result;
// //     if (db.objectStoreNames.contains("images")) {
// //       db.transaction("images", "readwrite").objectStore("images").delete("draft_image");
// //     }
// //   };
// // };

// // export default function CreateFont() {
// //   const [name, setName] = useState('')
// //   const [isSaving, setIsSaving] = useState(false)
// //   const [image, setImage] = useState(null)
// //   const [status, setStatus] = useState(null)
// //   const [visualPercent, setVisualPercent] = useState(0)
// //   const [viewPermission, setViewPermission] = useState('PRIVATE')
// //   const [allowedEmails, setAllowedEmails] = useState([])
// //   const [newEmail, setNewEmail] = useState('')
// //   const navigate = useNavigate()

// //  // --- 1. שחזור נתונים וטעינת עיצוב ---
// //   useEffect(() => {
// //     const draft = JSON.parse(localStorage.getItem('font_draft'));
// //     if (draft) {
// //       setName(draft.name || '');
// //       setViewPermission(draft.permission || 'PRIVATE');
// //       setAllowedEmails(draft.emails || []);
// //       // שחזור האחוז האחרון כדי שהסרגל לא יקפוץ ל-0
// //       if (draft.lastPercent) setVisualPercent(draft.lastPercent);
      
// //       getImageFromDB().then(file => { if (file) setImage(file); });

// //       if (draft.isSaving && draft.fontId) {
// //         setIsSaving(true);
// //         // לא קובעים סטטוס CONNECTING מיד, כדי לא להרוס את הוויזואליות
        
// //         fontService.getFontStatus(draft.fontId)
// //           .then(actualStatus => {
// //             console.log("Actual status from server:", actualStatus);
// //             setStatus(actualStatus);
// //             updateDraft({ status: actualStatus });
            
// //             if (actualStatus === 'COMPLETED' || actualStatus === 'FAILED') {
// //               setIsSaving(false);
// //               if (actualStatus === 'COMPLETED') {
// //                 setVisualPercent(100); // הבטחת מילוי הסרגל
// //                 alert('הפונט נוצר בהצלחה בזמן שלא היית כאן!');
// //                 localStorage.removeItem('font_draft');
// //                 clearImageFromDB();
// //                 navigate('/dashboard');
// //               } else {
// //                 alert('חלה שגיאה בעיבוד הפונט.');
// //               }
// //             } 
// //             else {
// //               connectAndProcess(draft.fontId, true); 
// //             }
// //           })
// //           .catch(err => {
// //             console.error("Status check failed, fallback to socket", err);
// //             connectAndProcess(draft.fontId, true);
// //           });
// //       }
// //     }

// //     // הקוד של ה-Style נשאר אותו דבר...
// //     const style = document.createElement('style');
// //     style.textContent = `
// //       @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
// //       .ai-spinner { display: inline-block; animation: spin 2s linear infinite; }
// //       @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
// //       .status-pulse { animation: pulse 1.5s infinite; }
// //       @keyframes shimmer { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
// //       .shimmer-bar { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shimmer 2s infinite; }
// //     `;
// //     document.head.appendChild(style);

// //     return () => {
// //       if (window.activeStompClient && window.activeStompClient.connected) {
// //           window.activeStompClient.disconnect();
// //           window.activeStompClient = null;
// //       }
// //     }
// //   }, [])

// //   // --- 2. לוגיקת סרגל התקדמות זוחל ---
// //   useEffect(() => {
// //     if (!isSaving || status === 'COMPLETED' || status === 'FAILED') return;
// //     const interval = setInterval(() => {
// //       setVisualPercent(prev => {
// //         const target = getProgressDetails().percent;
// //         let next = prev;
// //         if (prev < target) next = prev + 0.8; 
// //         else if (prev < 99.5) next = prev + 0.02; // זחילה סופר איטית בשיא
        
// //         // שמירת האחוז בטיוטה בכל חצי אחוז של שינוי (למניעת עומס)
// //         if (Math.abs(next - prev) > 0.1) {
// //             updateDraft({ lastPercent: next })
// //         }
// //         return next;
// //       });
// //     }, 100)
// //     return () => clearInterval(interval)
// //   }, [isSaving, status])

// //   const updateDraft = (updates) => {
// //     const current = JSON.parse(localStorage.getItem('font_draft') || '{}');
// //     localStorage.setItem('font_draft', JSON.stringify({ ...current, ...updates }));
// //   }

// //   const getProgressDetails = () => {
// //       switch(status) {
// //         case 'CONNECTING': return { percent: 5, color: '#94a3b8', label: 'מתחבר לשרת' };
// //         case 'PENDING':    return { percent: 25, color: '#f39c12', label: 'ממתין בתור' };
// //         case 'PROCESSING': return { percent: 75, color: '#3498db', label: 'מעבד' };
// //         case 'COMPLETED':  return { percent: 100, color: '#27ae60', label: 'הושלם בהצלחה!' };
// //         case 'FAILED':     return { percent: 100, color: '#e74c3c', label: 'העיבוד נכשל, נסה שנית' };
// //         default:           return { percent: 0, color: '#eee', label: '' };
// //       }
// //   }

// //   // --- 3. הפונקציה המרכזית: חיבור קודם, שליחה אחר כך ---
// //   const connectAndProcess = (existingFontId = null, isReconnect = false) => {
// //     const token = localStorage.getItem('token');
// //     const socket = new SockJS(`/api/ws-font-status?token=${token}`);
// //     const stompClient = Stomp.over(socket);
// //     window.activeStompClient = stompClient;
// //     stompClient.debug = null;

// //     if (!isReconnect) {
// //       setStatus('CONNECTING');
// //     }

// //     stompClient.connect({ 'Authorization': `Bearer ${token}` }, () => {
// //         // אם משתנה הגלובלי שלנו אופס, סימן שעזבנו את העמוד
// //       if (!window.activeStompClient) {
// //           stompClient.disconnect();
// //           return;
// //       }
// //       console.log('Connected to WebSocket');

// //       // א. אם זה חיבור חדש (לחיצה על הכפתור)
// //       if (!isReconnect) {
// //         const formData = new FormData();
// //         formData.append('fontName', name.trim());
// //         formData.append('image', image);
// //         formData.append('permission', viewPermission);
// //         if (viewPermission === 'RESTRICTED') allowedEmails.forEach(e => formData.append('allowedEmails', e));

// //         fontService.createFont(formData).then(savedFont => {
// //           const fontId = savedFont.id;
// //           updateDraft({ fontId, isSaving: true });
// //           subscribeToStatus(stompClient, fontId);
// //           setStatus('PENDING'); 
// //         }).catch(err => {
// //           setIsSaving(false);
// //           setStatus('FAILED');
// //           alert('שגיאה בהעלאת הנתונים');
// //         });
// //       } 
// //       // ב. אם זה שחזור אחרי ריפרש
// //       else if (existingFontId) {
// //         subscribeToStatus(stompClient, existingFontId);
// //       }
// //     }, () => {
// //       setIsSaving(false);
// //       setStatus('FAILED');
// //     });
// //   };

// //   const subscribeToStatus = (client, fontId) => {
// //     client.subscribe(`/topic/status/${fontId}`, (msg) => {
// //       const newStatus = msg.body;
// //       console.log("WebSocket Status Update:", newStatus);
// //       setStatus(newStatus);
// //       updateDraft({ status: newStatus });

// //       if (newStatus === 'COMPLETED') {
// //         alert('הפונט נוצר בהצלחה!');
// //         localStorage.removeItem('font_draft');
// //         clearImageFromDB();
// //         setTimeout(() => {
// //           client.disconnect();
// //           navigate('/dashboard');
// //         }, 1500);
// //       }
// //       if (newStatus === 'FAILED') {
// //         setIsSaving(false);
// //         alert('חלה שגיאה בעיבוד הפונט');
// //       }
// //     });
// //   };

// //   const handleSaveFont = () => {
// //     if (!name.trim() || !image) return alert('נא למלא שם ולבחור תמונה');
// //     setIsSaving(true);
// //     setVisualPercent(0);
// //     updateDraft({ name, permission: viewPermission, emails: allowedEmails, isSaving: true });
// //     connectAndProcess(); // מפעיל את החיבור שיוביל לשליחה
// //   };

// //   const progress = getProgressDetails();

// //   return (
// //     <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '3rem 1.5rem', direction: 'rtl' }}>
// //       <div style={{ maxWidth: '500px', margin: '0 auto', background: '#fff', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
// //         <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>יצירת פונט חדש</h2>

// //         {status && (
// //           <div style={{ marginBottom: '2rem' }}>
// //             <div style={{ height: '10px', background: '#eee', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
// //               <div style={{ height: '100%', width: `${visualPercent}%`, background: progress.color, transition: 'width 0.4s linear', position: 'relative' }}>
// //                 <div className="shimmer-bar" />
// //               </div>
// //             </div>
// //             <div style={{ textAlign: 'center', marginTop: '10px', color: progress.color, fontWeight: 'bold' }}>
// //               {isSaving && status !== 'COMPLETED' && status !== 'FAILED' && <span className="ai-spinner">⚙️</span>} 
// //               <span className="status-pulse">{progress.label} ({visualPercent.toFixed(1)}%)</span>
// //             </div>
// //           </div>
// //         )}

// //         <div style={{ display: 'grid', gap: '1rem' }}>
// //           <label style={{fontWeight:'bold'}}>שם הפונט</label>
// //           <input type="text" value={name} onChange={e => {setName(e.target.value); updateDraft({name: e.target.value});}} disabled={isSaving} placeholder="הכנס שם לפונט" style={styles.input} />

// //           <label style={{fontWeight:'bold'}}>תמונת כתב יד</label>
// //           <div style={{...styles.uploadBox, background: isSaving ? '#f9f9f9' : '#fff'}}>
// //             <input type="file" onChange={(e) => {
// //                 const file = e.target.files[0];
// //                 if (file) { setImage(file); saveImageToDB(file); updateDraft({ imageName: file.name }); }
// //             }} disabled={isSaving} style={styles.fileInput} />
// //             <div style={{color: '#666'}}>{image ? image.name : 'לחץ להעלאת תמונה'}</div>
// //           </div>

// //           <label style={{fontWeight:'bold'}}>פרטיות</label>
// //           <select value={viewPermission} onChange={e => {setViewPermission(e.target.value); updateDraft({permission: e.target.value});}} disabled={isSaving} style={styles.input}>
// //             <option value="PRIVATE">🔒 פרטי</option>
// //             <option value="PUBLIC">🌐 ציבורי</option>
// //             <option value="RESTRICTED">👥 מוגבל</option>
// //           </select>

// //           {viewPermission === 'RESTRICTED' && (
// //              <div style={styles.emailSection}>
// //                 <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
// //                     <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="מייל להוספה" style={{...styles.input, flex: 1}} />
// //                     <button type="button" onClick={() => {if(newEmail){setAllowedEmails([...allowedEmails, newEmail]); updateDraft({emails: [...allowedEmails, newEmail]}); setNewEmail('');}}} style={styles.addBtn}>הוסף</button>
// //                 </div>
// //                 <div style={{display:'flex', flexWrap:'wrap', gap:'5px'}}>
// //                     {allowedEmails.map(email => (
// //                         <span key={email} style={styles.tag}>{email} <b onClick={() => {const up = allowedEmails.filter(x => x !== email); setAllowedEmails(up); updateDraft({emails: up});}} style={{cursor:'pointer', color:'#e74c3c', marginRight:'5px'}}>×</b></span>
// //                     ))}
// //                 </div>
// //              </div>
// //           )}

// //           <button onClick={handleSaveFont} disabled={isSaving} style={{ ...styles.submitBtn, background: isSaving ? '#ccc' : '#2c3e50' }}>
// //             {isSaving ? 'מעבד נתונים...' : 'צור פונט עכשיו'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// // const styles = {
// //   input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' },
// //   uploadBox: { border: '2px dashed #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center', position: 'relative', cursor: 'pointer' },
// //   fileInput: { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' },
// //   submitBtn: { padding: '15px', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: '0.3s' },
// //   tag: { background: '#f0f0f0', padding: '5px 12px', borderRadius: '15px', fontSize: '12px', display: 'flex', alignItems: 'center', border: '1px solid #ddd' },
// //   addBtn: { background: '#2c3e50', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 15px', cursor: 'pointer' },
// //   emailSection: { background: '#f9f9f9', padding: '10px', borderRadius: '10px', border: '1px solid #eee' }
// // }

// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { fontService } from '../features/fonts/services/fontService'
// import SockJS from 'sockjs-client'
// import Stomp from 'stompjs'
// import { UploadCloud, Loader2, Lock, Globe, Users, X } from 'lucide-react'

// // ====== ערכת העיצוב (Hand2Font) ======
// const T = {
//   paper: '#FAF7F1', surface: '#FFFFFF', ink: '#241C15', inkSoft: '#736A5E', inkFaint: '#A79E90',
//   hair: '#EBE4D7', hairStrong: '#DDD4C3', orange: '#E8741E', orangeSoft: '#FCEFE2',
//   indigo: '#3F40C4',
//   shadow: '0 1px 2px rgba(36,28,21,.04), 0 8px 30px rgba(36,28,21,.05)',
//   fontSans: "'Assistant', sans-serif", fontSerif: "'Frank Ruhl Libre', serif",
// }

// // --- פונקציות עזר לניהול IndexedDB (לשמירת התמונה בטיוטה) ---
// const saveImageToDB = (file) => {
//   const request = indexedDB.open("FontDraftDB", 1);
//   request.onupgradeneeded = (e) => {
//     if (!e.target.result.objectStoreNames.contains("images")) {
//       e.target.result.createObjectStore("images");
//     }
//   };
//   request.onsuccess = (e) => {
//     const db = e.target.result;
//     const tx = db.transaction("images", "readwrite");
//     tx.objectStore("images").put(file, "draft_image");
//   };
// };

// const getImageFromDB = () => {
//   return new Promise((resolve) => {
//     const request = indexedDB.open("FontDraftDB", 1);
//     request.onsuccess = (e) => {
//       const db = e.target.result;
//       if (!db.objectStoreNames.contains("images")) return resolve(null);
//       const tx = db.transaction("images", "readonly");
//       const getReq = tx.objectStore("images").get("draft_image");
//       getReq.onsuccess = () => resolve(getReq.result);
//     };
//     request.onupgradeneeded = (e) => e.target.result.createObjectStore("images");
//   });
// };

// const clearImageFromDB = () => {
//   const request = indexedDB.open("FontDraftDB", 1);
//   request.onsuccess = (e) => {
//     const db = e.target.result;
//     if (db.objectStoreNames.contains("images")) {
//       db.transaction("images", "readwrite").objectStore("images").delete("draft_image");
//     }
//   };
// };

// export default function CreateFont() {
//   const [name, setName] = useState('')
//   const [isSaving, setIsSaving] = useState(false)
//   const [image, setImage] = useState(null)
//   const [status, setStatus] = useState(null)
//   const [visualPercent, setVisualPercent] = useState(0)
//   const [viewPermission, setViewPermission] = useState('PRIVATE')
//   const [allowedEmails, setAllowedEmails] = useState([])
//   const [newEmail, setNewEmail] = useState('')
//   const [emailError, setEmailError] = useState('')
//   const navigate = useNavigate()

//   // --- 1. שחזור נתונים וטעינת עיצוב ---
//   useEffect(() => {
//     // טעינת גופני המערכת (פעם אחת)
//     if (!document.getElementById('h2f-fonts')) {
//       const link = document.createElement('link')
//       link.id = 'h2f-fonts'
//       link.rel = 'stylesheet'
//       link.href = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&family=Frank+Ruhl+Libre:wght@400;500;700&display=swap'
//       document.head.appendChild(link)
//     }

//     const draft = JSON.parse(localStorage.getItem('font_draft'));
//     if (draft) {
//       setName(draft.name || '');
//       setViewPermission(draft.permission || 'PRIVATE');
//       setAllowedEmails(draft.emails || []);
//       if (draft.lastPercent) setVisualPercent(draft.lastPercent);

//       getImageFromDB().then(file => { if (file) setImage(file); });

//       if (draft.isSaving && draft.fontId) {
//         setIsSaving(true);

//         fontService.getFontStatus(draft.fontId)
//           .then(actualStatus => {
//             console.log("Actual status from server:", actualStatus);
//             setStatus(actualStatus);
//             updateDraft({ status: actualStatus });

//             if (actualStatus === 'COMPLETED' || actualStatus === 'FAILED') {
//               setIsSaving(false);
//               if (actualStatus === 'COMPLETED') {
//                 setVisualPercent(100);
//                 alert('הפונט נוצר בהצלחה בזמן שלא היית כאן!');
//                 localStorage.removeItem('font_draft');
//                 clearImageFromDB();
//                 navigate('/dashboard');
//               } else {
//                 alert('חלה שגיאה בעיבוד הפונט.');
//               }
//             }
//             else {
//               connectAndProcess(draft.fontId, true);
//             }
//           })
//           .catch(err => {
//             console.error("Status check failed, fallback to socket", err);
//             connectAndProcess(draft.fontId, true);
//           });
//       }
//     }

//     // הזרקת אנימציות (סיבוב + נצנוץ סרגל)
//     const style = document.createElement('style');
//     style.textContent = `
//       @keyframes h2f-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
//       .h2f-spin { display: inline-block; animation: h2f-spin 2s linear infinite; }
//       @keyframes h2f-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
//       .h2f-pulse { animation: h2f-pulse 1.5s infinite; }
//       @keyframes h2f-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
//       .h2f-shimmer { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent); animation: h2f-shimmer 2s infinite; }
//     `;
//     document.head.appendChild(style);

//     return () => {
//       if (window.activeStompClient && window.activeStompClient.connected) {
//         window.activeStompClient.disconnect();
//         window.activeStompClient = null;
//       }
//     }
//   }, [])

//   // --- 2. לוגיקת סרגל התקדמות זוחל ---
//   useEffect(() => {
//     if (!isSaving || status === 'COMPLETED' || status === 'FAILED') return;
//     const interval = setInterval(() => {
//       setVisualPercent(prev => {
//         const target = getProgressDetails().percent;
//         let next = prev;
//         if (prev < target) next = prev + 0.8;
//         else if (prev < 99.5) next = prev + 0.02;

//         if (Math.abs(next - prev) > 0.1) {
//           updateDraft({ lastPercent: next })
//         }
//         return next;
//       });
//     }, 100)
//     return () => clearInterval(interval)
//   }, [isSaving, status])

//   const updateDraft = (updates) => {
//     const current = JSON.parse(localStorage.getItem('font_draft') || '{}');
//     localStorage.setItem('font_draft', JSON.stringify({ ...current, ...updates }));
//   }

//   const getProgressDetails = () => {
//     switch (status) {
//       case 'CONNECTING': return { percent: 5, color: T.inkFaint, label: 'מתחבר לשרת' };
//       case 'PENDING': return { percent: 25, color: T.orange, label: 'ממתין בתור' };
//       case 'PROCESSING': return { percent: 75, color: T.indigo, label: 'מעבד' };
//       case 'COMPLETED': return { percent: 100, color: '#2f8f5b', label: 'הושלם בהצלחה!' };
//       case 'FAILED': return { percent: 100, color: '#c0492b', label: 'העיבוד נכשל, נסה שנית' };
//       default: return { percent: 0, color: T.hair, label: '' };
//     }
//   }

//   // --- 3. הפונקציה המרכזית: חיבור קודם, שליחה אחר כך ---
//   const connectAndProcess = (existingFontId = null, isReconnect = false) => {
//     const token = localStorage.getItem('token');
//     const socket = new SockJS(`/api/ws-font-status?token=${token}`);
//     const stompClient = Stomp.over(socket);
//     window.activeStompClient = stompClient;
//     stompClient.debug = null;

//     if (!isReconnect) {
//       setStatus('CONNECTING');
//     }

//     stompClient.connect({ 'Authorization': `Bearer ${token}` }, () => {
//       if (!window.activeStompClient) {
//         stompClient.disconnect();
//         return;
//       }
//       console.log('Connected to WebSocket');

//       if (!isReconnect) {
//         const formData = new FormData();
//         formData.append('fontName', name.trim());
//         formData.append('image', image);
//         formData.append('permission', viewPermission);
//         if (viewPermission === 'RESTRICTED') allowedEmails.forEach(e => formData.append('allowedEmails', e));

//         fontService.createFont(formData).then(savedFont => {
//           const fontId = savedFont.id;
//           updateDraft({ fontId, isSaving: true });
//           subscribeToStatus(stompClient, fontId);
//           setStatus('PENDING');
//         }).catch(err => {
//           setIsSaving(false);
//           setStatus('FAILED');
//           alert('שגיאה בהעלאת הנתונים');
//         });
//       }
//       else if (existingFontId) {
//         subscribeToStatus(stompClient, existingFontId);
//       }
//     }, () => {
//       setIsSaving(false);
//       setStatus('FAILED');
//     });
//   };

//   // const subscribeToStatus = (client, fontId) => {
//   //   client.subscribe(`/topic/status/${fontId}`, (msg) => {
//   //     const newStatus = msg.body;
//   //     console.log("WebSocket Status Update:", newStatus);
//   //     setStatus(newStatus);
//   //     updateDraft({ status: newStatus });

//   //     if (newStatus === 'COMPLETED') {
//   //       alert('הפונט נוצר בהצלחה!');
//   //       localStorage.removeItem('font_draft');
//   //       clearImageFromDB();
//   //       setTimeout(() => {
//   //         client.disconnect();
//   //         navigate('/dashboard');
//   //       }, 1500);
//   //     }
//   //     if (newStatus === 'FAILED') {
//   //       setIsSaving(false);
//   //       alert('חלה שגיאה בעיבוד הפונט');
//   //     }
//   //   });
//   // };

//   const subscribeToStatus = (client, fontId) => {
//     client.subscribe(`/topic/status/${fontId}`, (msg) => {
//       // ההודעה מגיעה עכשיו כ-JSON. למשל:
//       //   {"status":"COMPLETED"}
//       //   {"status":"TAGGED","geometric":...,"content":...,"expression":...}
//       // מנסים לפענח JSON; אם זו מחרוזת פשוטה — נופלים אחורה אליה.
//       let evt;
//       try {
//         evt = JSON.parse(msg.body);
//         if (!evt || !evt.status) evt = { status: String(msg.body) };
//       } catch {
//         evt = { status: String(msg.body) };
//       }
//       const newStatus = evt.status;
//       console.log("WebSocket event:", evt);

//       // אירוע התיוג — נושא את שלוש התגיות (evt.geometric / evt.content / evt.expression).
//       // כרגע רק מקבלים ומבדילים אותו, בלי לשנות תצוגה.
//       if (newStatus === 'TAGGED') {
//         return;
//       }

//       // אירועי סטטוס רגילים: PROCESSING / COMPLETED / FAILED
//       setStatus(newStatus);
//       updateDraft({ status: newStatus });

//       if (newStatus === 'COMPLETED') {
//         alert('הפונט נוצר בהצלחה!');
//         localStorage.removeItem('font_draft');
//         clearImageFromDB();
//         setTimeout(() => {
//           client.disconnect();
//           navigate('/dashboard');
//         }, 1500);
//       }
//       if (newStatus === 'FAILED') {
//         setIsSaving(false);
//         alert('חלה שגיאה בעיבוד הפונט');
//       }
//     });
//   };

//   const handleSaveFont = () => {
//     if (!name.trim() || !image) return alert('נא למלא שם ולבחור תמונה');
//     setIsSaving(true);
//     setVisualPercent(0);
//     updateDraft({ name, permission: viewPermission, emails: allowedEmails, isSaving: true });
//     connectAndProcess();
//   };

//   const progress = getProgressDetails();

//   // הוספת אימייל עם בדיקת תקינות
//   const handleAddEmail = () => {
//     const email = newEmail.trim()
//     if (!email) { setEmailError('יש להזין כתובת אימייל'); return; }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('כתובת אימייל לא תקינה'); return; }
//     if (allowedEmails.includes(email)) { setEmailError('האימייל כבר ברשימה'); return; }
//     const updated = [...allowedEmails, email]
//     setAllowedEmails(updated); updateDraft({ emails: updated });
//     setNewEmail(''); setEmailError('');
//   }

//   const permOptions = [
//     { val: 'PRIVATE', icon: <Lock size={16} />, label: 'פרטי' },
//     { val: 'PUBLIC', icon: <Globe size={16} />, label: 'ציבורי' },
//     { val: 'RESTRICTED', icon: <Users size={16} />, label: 'מוגבל' },
//   ]

//   return (
//     <div style={{ minHeight: '100vh', padding: '3rem 1.5rem', direction: 'rtl', fontFamily: T.fontSans, color: T.ink }}>
//       <div style={{ maxWidth: '520px', margin: '0 auto', background: T.surface, borderRadius: '18px', padding: '2.5rem', boxShadow: T.shadow, border: `1px solid ${T.hair}` }}>
//         <h2 style={{ marginBottom: '0.4rem', textAlign: 'center', fontFamily: T.fontSerif, fontWeight: 500, fontSize: '1.7rem' }}>
//           יצירת פונט חדש
//         </h2>
//         <p style={{ textAlign: 'center', color: T.inkSoft, fontSize: '0.95rem', marginBottom: '1.8rem' }}>
         
//         </p>

//         {status && (
//           <div style={{ marginBottom: '2rem' }}>
//             <div style={{ height: '10px', background: '#F0EDE5', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
//               <div style={{ height: '100%', width: `${visualPercent}%`, background: progress.color, transition: 'width 0.4s linear', position: 'relative', borderRadius: '10px' }}>
//                 <div className="h2f-shimmer" />
//               </div>
//             </div>
//             <div style={{ textAlign: 'center', marginTop: '10px', color: progress.color, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
//               {isSaving && status !== 'COMPLETED' && status !== 'FAILED' &&
//                 <Loader2 size={16} className="h2f-spin" />}
//               <span className="h2f-pulse">{progress.label} ({visualPercent.toFixed(1)}%)</span>
//             </div>
//           </div>
//         )}

//         <div style={{ display: 'grid', gap: '1.2rem' }}>
//           <div>
//             <label style={labelStyle}>שם הפונט</label>
//             <input type="text" value={name}
//               onChange={e => { setName(e.target.value); updateDraft({ name: e.target.value }); }}
//               disabled={isSaving} placeholder="לדוגמה: כתב היד של אמא" style={inputStyle} />
//           </div>

//           <div>
//             <label style={labelStyle}>תמונת כתב יד</label>
//             <div style={{ ...uploadBox, background: isSaving ? '#F5F2EB' : '#FCFAF6' }}>
//               <input type="file" onChange={(e) => {
//                 const file = e.target.files[0];
//                 if (file) { setImage(file); saveImageToDB(file); updateDraft({ imageName: file.name }); }
//               }} disabled={isSaving} style={fileInput} />
//               <UploadCloud size={28} style={{ color: T.inkFaint, marginBottom: '6px' }} />
//               <div style={{ color: image ? T.ink : T.inkSoft, fontWeight: image ? 600 : 400 }}>
//                 {image ? image.name : 'גררו לכאן תמונה או לחצו לבחירה'}
//               </div>
//             </div>
//           </div>

//           <div>
//             <label style={labelStyle}>פרטיות</label>
//             <div style={{ display: 'flex', gap: '8px' }}>
//               {permOptions.map(opt => {
//                 const active = viewPermission === opt.val
//                 return (
//                   <button key={opt.val} type="button" disabled={isSaving}
//                     onClick={() => { setViewPermission(opt.val); updateDraft({ permission: opt.val }); }}
//                     style={{
//                       flex: 1, padding: '11px 8px', borderRadius: '10px', cursor: isSaving ? 'not-allowed' : 'pointer',
//                       border: `1px solid ${active ? T.ink : T.hairStrong}`,
//                       background: active ? T.ink : '#FCFAF6', color: active ? '#F3ECE0' : T.ink,
//                       fontFamily: T.fontSans, fontWeight: 600, fontSize: '0.9rem',
//                       display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: '.2s',
//                     }}>
//                     {opt.icon} {opt.label}
//                   </button>
//                 )
//               })}
//             </div>
//           </div>

//           {viewPermission === 'RESTRICTED' && (
//             <div style={{ background: '#FCFAF6', padding: '14px', borderRadius: '12px', border: `1px solid ${T.hair}` }}>
//               <div style={{ display: 'flex', gap: '6px', marginBottom: emailError ? '6px' : '10px' }}>
//                 <input type="email" value={newEmail}
//                   onChange={e => { setNewEmail(e.target.value); if (emailError) setEmailError(''); }}
//                   onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddEmail(); } }}
//                   placeholder="מייל להוספה"
//                   style={{ ...inputStyle, flex: 1, border: `1px solid ${emailError ? '#c0492b' : T.hairStrong}` }} />
//                 <button type="button" onClick={handleAddEmail}
//                   style={{ background: T.ink, color: '#F3ECE0', border: 'none', borderRadius: '10px', padding: '0 18px', cursor: 'pointer', fontFamily: T.fontSans, fontWeight: 600 }}>
//                   הוסף
//                 </button>
//               </div>
//               {emailError && <div style={{ color: '#c0492b', fontSize: '0.82rem', marginBottom: '10px' }}>{emailError}</div>}
//               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
//                 {allowedEmails.map(email => (
//                   <span key={email} style={{ background: '#fff', padding: '5px 12px', borderRadius: '99px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid ${T.hair}` }}>
//                     {email}
//                     <X size={13} style={{ cursor: 'pointer', color: '#c0492b' }}
//                       onClick={() => { const up = allowedEmails.filter(x => x !== email); setAllowedEmails(up); updateDraft({ emails: up }); }} />
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           <button onClick={handleSaveFont} disabled={isSaving}
//             style={{
//               padding: '15px', color: '#fff', border: 'none', borderRadius: '10px',
//               fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', marginTop: '6px',
//               transition: '.2s', fontFamily: T.fontSans, fontSize: '1rem',
//               background: isSaving ? T.hairStrong : T.orange,
//             }}>
//             {isSaving ? 'מעבד נתונים' : 'צור פונט '}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// const labelStyle = { display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: '#241C15' }
// const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #DDD4C3', outline: 'none', fontFamily: "'Assistant', sans-serif", fontSize: '1rem', background: '#FCFAF6', color: '#241C15' }
// const uploadBox = { border: '1.5px dashed #DDD4C3', padding: '26px 20px', borderRadius: '10px', textAlign: 'center', position: 'relative', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }
// const fileInput = { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }



import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fontService } from '../features/fonts/services/fontService'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import { UploadCloud, Loader2, Lock, Globe, Users, X, Info, AlertTriangle } from 'lucide-react'

// ====== ערכת העיצוב (Hand2Font) ======
const T = {
  paper: '#FAF7F1', surface: '#FFFFFF', ink: '#241C15', inkSoft: '#736A5E', inkFaint: '#A79E90',
  hair: '#EBE4D7', hairStrong: '#DDD4C3', orange: '#E8741E', orangeSoft: '#FCEFE2',
  indigo: '#3F40C4',
  shadow: '0 1px 2px rgba(36,28,21,.04), 0 8px 30px rgba(36,28,21,.05)',
  fontSans: "'Assistant', sans-serif", fontSerif: "'Frank Ruhl Libre', serif",
}

// --- פונקציות עזר לניהול IndexedDB (לשמירת התמונה בטיוטה) ---
const saveImageToDB = (file) => {
  const request = indexedDB.open("FontDraftDB", 1);
  request.onupgradeneeded = (e) => {
    if (!e.target.result.objectStoreNames.contains("images")) {
      e.target.result.createObjectStore("images");
    }
  };
  request.onsuccess = (e) => {
    const db = e.target.result;
    const tx = db.transaction("images", "readwrite");
    tx.objectStore("images").put(file, "draft_image");
  };
};

const getImageFromDB = () => {
  return new Promise((resolve) => {
    const request = indexedDB.open("FontDraftDB", 1);
    request.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("images")) return resolve(null);
      const tx = db.transaction("images", "readonly");
      const getReq = tx.objectStore("images").get("draft_image");
      getReq.onsuccess = () => resolve(getReq.result);
    };
    request.onupgradeneeded = (e) => e.target.result.createObjectStore("images");
  });
};

const clearImageFromDB = () => {
  const request = indexedDB.open("FontDraftDB", 1);
  request.onsuccess = (e) => {
    const db = e.target.result;
    if (db.objectStoreNames.contains("images")) {
      db.transaction("images", "readwrite").objectStore("images").delete("draft_image");
    }
  };
};

// --- רשימת ההנחיות להכנת דף כתב היד ---
const GUIDELINES = [
  'כתבו על דף לבן ונקי באמצעות עט כהה וברור.',
  'הקפידו על תאורה טובה והימנעו מצללים או השתקפויות.',
  'השאירו רווח בין האותיות כדי לאפשר זיהוי מדויק.',
  'ודאו שכל האותיות שברצונכם שיופיעו בגופן הסופי מופיעות בדף הקלט.',
  'צלמו או סרקו באיכות גבוהה, ללא חיתוך של קצות הדף.',
  'העלו את הדף כשהוא מיושר – לאורך או לרוחב – ללא סיבוב או היפוך.',
  'מומלץ להשתמש בתמונה חדה וללא טשטוש.',
]

// --- קומפוננטת חלון ההנחיות ---
function InstructionsModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(36,28,21,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1.5rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface, borderRadius: '18px', maxWidth: '520px', width: '100%',
          maxHeight: '85vh', overflowY: 'auto', boxShadow: T.shadow,
          border: `1px solid ${T.hair}`, direction: 'rtl', fontFamily: T.fontSans, color: T.ink,
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <h3 style={{ fontFamily: T.fontSerif, fontWeight: 500, fontSize: '1.4rem', margin: 0 }}>
            הנחיות להכנת דף כתב היד
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            style={{
              background: '#FCFAF6', border: `1px solid ${T.hair}`, borderRadius: '10px',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: T.inkSoft, flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ color: T.inkSoft, fontSize: '0.92rem', marginBottom: '1.4rem', marginTop: 0 }}>
          כדי לקבל את התוצאה האיכותית ביותר, יש להקפיד על ההנחיות הבאות:
        </p>

        <div style={{ display: 'grid', gap: '10px', marginBottom: '1.4rem' }}>
          {GUIDELINES.map((text, i) => (
            <div
              key={i}
              style={{
                border: `1px solid ${T.hair}`, background: '#FCFAF6', borderRadius: '12px',
                padding: '12px 14px', fontSize: '0.92rem', lineHeight: 1.55, color: T.ink,
              }}
            >
              {text}
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex', gap: '10px', alignItems: 'flex-start',
            background: T.orangeSoft, border: `1px solid ${T.hair}`, borderRadius: '12px',
            padding: '14px', marginBottom: '1.6rem',
          }}
        >
          <AlertTriangle size={18} style={{ color: T.orange, flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.88rem', color: T.ink, lineHeight: 1.55 }}>
            <b>חשוב לדעת:</b> אי־עמידה בהנחיות עלולה לפגוע באיכות הזיהוי ובאיכות הגופן שייווצר.
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%', padding: '13px', color: '#fff', border: 'none', borderRadius: '10px',
            fontWeight: 600, cursor: 'pointer', fontFamily: T.fontSans, fontSize: '1rem',
            background: T.orange,
          }}
        >
          הבנתי
        </button>
      </div>
    </div>
  )
}

export default function CreateFont() {
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [image, setImage] = useState(null)
  const [status, setStatus] = useState(null)
  const [visualPercent, setVisualPercent] = useState(0)
  const [viewPermission, setViewPermission] = useState('PRIVATE')
  const [allowedEmails, setAllowedEmails] = useState([])
  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)
  const navigate = useNavigate()

  // --- 1. שחזור נתונים וטעינת עיצוב ---
  useEffect(() => {
    // טעינת גופני המערכת (פעם אחת)
    if (!document.getElementById('h2f-fonts')) {
      const link = document.createElement('link')
      link.id = 'h2f-fonts'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&family=Frank+Ruhl+Libre:wght@400;500;700&display=swap'
      document.head.appendChild(link)
    }

    const draft = JSON.parse(localStorage.getItem('font_draft'));
    if (draft) {
      setName(draft.name || '');
      setViewPermission(draft.permission || 'PRIVATE');
      setAllowedEmails(draft.emails || []);
      if (draft.lastPercent) setVisualPercent(draft.lastPercent);

      getImageFromDB().then(file => { if (file) setImage(file); });

      if (draft.isSaving && draft.fontId) {
        setIsSaving(true);

        fontService.getFontStatus(draft.fontId)
          .then(actualStatus => {
            console.log("Actual status from server:", actualStatus);
            setStatus(actualStatus);
            updateDraft({ status: actualStatus });

            if (actualStatus === 'COMPLETED' || actualStatus === 'FAILED') {
              setIsSaving(false);
              if (actualStatus === 'COMPLETED') {
                setVisualPercent(100);
                alert('הפונט נוצר בהצלחה בזמן שלא היית כאן!');
                localStorage.removeItem('font_draft');
                clearImageFromDB();
                navigate('/dashboard');
              } else {
                alert('חלה שגיאה בעיבוד הפונט.');
              }
            }
            else {
              connectAndProcess(draft.fontId, true);
            }
          })
          .catch(err => {
            console.error("Status check failed, fallback to socket", err);
            connectAndProcess(draft.fontId, true);
          });
      }
    }

    // הזרקת אנימציות (סיבוב + נצנוץ סרגל)
    const style = document.createElement('style');
    style.textContent = `
      @keyframes h2f-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .h2f-spin { display: inline-block; animation: h2f-spin 2s linear infinite; }
      @keyframes h2f-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
      .h2f-pulse { animation: h2f-pulse 1.5s infinite; }
      @keyframes h2f-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      .h2f-shimmer { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent); animation: h2f-shimmer 2s infinite; }
    `;
    document.head.appendChild(style);

    return () => {
      if (window.activeStompClient && window.activeStompClient.connected) {
        window.activeStompClient.disconnect();
        window.activeStompClient = null;
      }
    }
  }, [])

  // --- 2. לוגיקת סרגל התקדמות זוחל ---
  useEffect(() => {
    if (!isSaving || status === 'COMPLETED' || status === 'FAILED') return;
    const interval = setInterval(() => {
      setVisualPercent(prev => {
        const target = getProgressDetails().percent;
        let next = prev;
        if (prev < target) next = prev + 0.8;
        else if (prev < 99.5) next = prev + 0.02;

        if (Math.abs(next - prev) > 0.1) {
          updateDraft({ lastPercent: next })
        }
        return next;
      });
    }, 100)
    return () => clearInterval(interval)
  }, [isSaving, status])

  const updateDraft = (updates) => {
    const current = JSON.parse(localStorage.getItem('font_draft') || '{}');
    localStorage.setItem('font_draft', JSON.stringify({ ...current, ...updates }));
  }

  const getProgressDetails = () => {
    switch (status) {
      case 'CONNECTING': return { percent: 5, color: T.inkFaint, label: 'מתחבר לשרת' };
      case 'PENDING': return { percent: 25, color: T.orange, label: 'ממתין בתור' };
      case 'PROCESSING': return { percent: 75, color: T.indigo, label: 'מעבד' };
      case 'COMPLETED': return { percent: 100, color: '#2f8f5b', label: 'הושלם בהצלחה!' };
      case 'FAILED': return { percent: 100, color: '#c0492b', label: 'העיבוד נכשל, נסה שנית' };
      default: return { percent: 0, color: T.hair, label: '' };
    }
  }

  // --- 3. הפונקציה המרכזית: חיבור קודם, שליחה אחר כך ---
  const connectAndProcess = (existingFontId = null, isReconnect = false) => {
    const token = localStorage.getItem('token');
    const socket = new SockJS(`/api/ws-font-status?token=${token}`);
    const stompClient = Stomp.over(socket);
    window.activeStompClient = stompClient;
    stompClient.debug = null;

    if (!isReconnect) {
      setStatus('CONNECTING');
    }

    stompClient.connect({ 'Authorization': `Bearer ${token}` }, () => {
      if (!window.activeStompClient) {
        stompClient.disconnect();
        return;
      }
      console.log('Connected to WebSocket');

      if (!isReconnect) {
        const formData = new FormData();
        formData.append('fontName', name.trim());
        formData.append('image', image);
        formData.append('permission', viewPermission);
        if (viewPermission === 'RESTRICTED') allowedEmails.forEach(e => formData.append('allowedEmails', e));

        fontService.createFont(formData).then(savedFont => {
          const fontId = savedFont.id;
          updateDraft({ fontId, isSaving: true });
          subscribeToStatus(stompClient, fontId);
          setStatus('PENDING');
        }).catch(err => {
          setIsSaving(false);
          setStatus('FAILED');
          alert('שגיאה בהעלאת הנתונים');
        });
      }
      else if (existingFontId) {
        subscribeToStatus(stompClient, existingFontId);
      }
    }, () => {
      setIsSaving(false);
      setStatus('FAILED');
    });
  };

  const subscribeToStatus = (client, fontId) => {
    client.subscribe(`/topic/status/${fontId}`, (msg) => {
      // ההודעה מגיעה עכשיו כ-JSON. למשל:
      //   {"status":"COMPLETED"}
      //   {"status":"TAGGED","geometric":...,"content":...,"expression":...}
      // מנסים לפענח JSON; אם זו מחרוזת פשוטה — נופלים אחורה אליה.
      let evt;
      try {
        evt = JSON.parse(msg.body);
        if (!evt || !evt.status) evt = { status: String(msg.body) };
      } catch {
        evt = { status: String(msg.body) };
      }
      const newStatus = evt.status;
      console.log("WebSocket event:", evt);

      // אירוע התיוג — נושא את שלוש התגיות (evt.geometric / evt.content / evt.expression).
      // כרגע רק מקבלים ומבדילים אותו, בלי לשנות תצוגה.
      if (newStatus === 'TAGGED') {
        return;
      }

      // אירועי סטטוס רגילים: PROCESSING / COMPLETED / FAILED
      setStatus(newStatus);
      updateDraft({ status: newStatus });

      if (newStatus === 'COMPLETED') {
        alert('הפונט נוצר בהצלחה!');
        localStorage.removeItem('font_draft');
        clearImageFromDB();
        setTimeout(() => {
          client.disconnect();
          navigate('/dashboard');
        }, 1500);
      }
      if (newStatus === 'FAILED') {
        setIsSaving(false);
        alert('חלה שגיאה בעיבוד הפונט');
      }
    });
  };

  const handleSaveFont = () => {
    if (!name.trim() || !image) return alert('נא למלא שם ולבחור תמונה');
    setIsSaving(true);
    setVisualPercent(0);
    updateDraft({ name, permission: viewPermission, emails: allowedEmails, isSaving: true });
    connectAndProcess();
  };

  const progress = getProgressDetails();

  // הוספת אימייל עם בדיקת תקינות
  const handleAddEmail = () => {
    const email = newEmail.trim()
    if (!email) { setEmailError('יש להזין כתובת אימייל'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('כתובת אימייל לא תקינה'); return; }
    if (allowedEmails.includes(email)) { setEmailError('האימייל כבר ברשימה'); return; }
    const updated = [...allowedEmails, email]
    setAllowedEmails(updated); updateDraft({ emails: updated });
    setNewEmail(''); setEmailError('');
  }

  const permOptions = [
    { val: 'PRIVATE', icon: <Lock size={16} />, label: 'פרטי' },
    { val: 'PUBLIC', icon: <Globe size={16} />, label: 'ציבורי' },
    { val: 'RESTRICTED', icon: <Users size={16} />, label: 'מוגבל' },
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '3rem 1.5rem', direction: 'rtl', fontFamily: T.fontSans, color: T.ink }}>
      <div style={{ maxWidth: '520px', margin: '0 auto', background: T.surface, borderRadius: '18px', padding: '2.5rem', boxShadow: T.shadow, border: `1px solid ${T.hair}` }}>
        <h2 style={{ marginBottom: '0.4rem', textAlign: 'center', fontFamily: T.fontSerif, fontWeight: 500, fontSize: '1.7rem' }}>
          יצירת פונט חדש
        </h2>
        <p style={{ textAlign: 'center', color: T.inkSoft, fontSize: '0.95rem', marginBottom: '1.8rem' }}>

        </p>

        {status && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ height: '10px', background: '#F0EDE5', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', width: `${visualPercent}%`, background: progress.color, transition: 'width 0.4s linear', position: 'relative', borderRadius: '10px' }}>
                <div className="h2f-shimmer" />
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px', color: progress.color, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {isSaving && status !== 'COMPLETED' && status !== 'FAILED' &&
                <Loader2 size={16} className="h2f-spin" />}
              <span className="h2f-pulse">{progress.label} ({visualPercent.toFixed(1)}%)</span>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '1.2rem' }}>
          <div>
            <label style={labelStyle}>שם הפונט</label>
            <input type="text" value={name}
              onChange={e => { setName(e.target.value); updateDraft({ name: e.target.value }); }}
              disabled={isSaving} placeholder="לדוגמה: כתב היד של אמא" style={inputStyle} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>תמונת כתב יד</label>
              <button
                type="button"
                onClick={() => setShowInstructions(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: T.orange, fontFamily: T.fontSans, fontWeight: 600, fontSize: '0.85rem',
                  padding: '2px 4px',
                }}
              >
                <Info size={15} />
                הנחיות
              </button>
            </div>
            <div style={{ ...uploadBox, background: isSaving ? '#F5F2EB' : '#FCFAF6' }}>
              <input type="file" onChange={(e) => {
                const file = e.target.files[0];
                if (file) { setImage(file); saveImageToDB(file); updateDraft({ imageName: file.name }); }
              }} disabled={isSaving} style={fileInput} />
              <UploadCloud size={28} style={{ color: T.inkFaint, marginBottom: '6px' }} />
              <div style={{ color: image ? T.ink : T.inkSoft, fontWeight: image ? 600 : 400 }}>
                {image ? image.name : 'גררו לכאן תמונה או לחצו לבחירה'}
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>פרטיות</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {permOptions.map(opt => {
                const active = viewPermission === opt.val
                return (
                  <button key={opt.val} type="button" disabled={isSaving}
                    onClick={() => { setViewPermission(opt.val); updateDraft({ permission: opt.val }); }}
                    style={{
                      flex: 1, padding: '11px 8px', borderRadius: '10px', cursor: isSaving ? 'not-allowed' : 'pointer',
                      border: `1px solid ${active ? T.ink : T.hairStrong}`,
                      background: active ? T.ink : '#FCFAF6', color: active ? '#F3ECE0' : T.ink,
                      fontFamily: T.fontSans, fontWeight: 600, fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: '.2s',
                    }}>
                    {opt.icon} {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {viewPermission === 'RESTRICTED' && (
            <div style={{ background: '#FCFAF6', padding: '14px', borderRadius: '12px', border: `1px solid ${T.hair}` }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: emailError ? '6px' : '10px' }}>
                <input type="email" value={newEmail}
                  onChange={e => { setNewEmail(e.target.value); if (emailError) setEmailError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddEmail(); } }}
                  placeholder="מייל להוספה"
                  style={{ ...inputStyle, flex: 1, border: `1px solid ${emailError ? '#c0492b' : T.hairStrong}` }} />
                <button type="button" onClick={handleAddEmail}
                  style={{ background: T.ink, color: '#F3ECE0', border: 'none', borderRadius: '10px', padding: '0 18px', cursor: 'pointer', fontFamily: T.fontSans, fontWeight: 600 }}>
                  הוסף
                </button>
              </div>
              {emailError && <div style={{ color: '#c0492b', fontSize: '0.82rem', marginBottom: '10px' }}>{emailError}</div>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {allowedEmails.map(email => (
                  <span key={email} style={{ background: '#fff', padding: '5px 12px', borderRadius: '99px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid ${T.hair}` }}>
                    {email}
                    <X size={13} style={{ cursor: 'pointer', color: '#c0492b' }}
                      onClick={() => { const up = allowedEmails.filter(x => x !== email); setAllowedEmails(up); updateDraft({ emails: up }); }} />
                  </span>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleSaveFont} disabled={isSaving}
            style={{
              padding: '15px', color: '#fff', border: 'none', borderRadius: '10px',
              fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', marginTop: '6px',
              transition: '.2s', fontFamily: T.fontSans, fontSize: '1rem',
              background: isSaving ? T.hairStrong : T.orange,
            }}>
            {isSaving ? 'מעבד נתונים' : 'צור פונט '}
          </button>
        </div>
      </div>

      {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
    </div>
  )
}

const labelStyle = { display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: '#241C15' }
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #DDD4C3', outline: 'none', fontFamily: "'Assistant', sans-serif", fontSize: '1rem', background: '#FCFAF6', color: '#241C15' }
const uploadBox = { border: '1.5px dashed #DDD4C3', padding: '26px 20px', borderRadius: '10px', textAlign: 'center', position: 'relative', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }
const fileInput = { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }