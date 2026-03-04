import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fontService } from '../features/fonts/services/fontService'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

export default function CreateFont() {
  const [name, setName] = useState('')
  const [viewPermission, setViewPermission] = useState('public')
  const [isSaving, setIsSaving] = useState(false)
  const [image, setImage] = useState(null)
  const [status, setStatus] = useState(null)
  const navigate = useNavigate()

  const handleSaveFont = async () => {
    if (!name.trim()) {
      alert('אנא מלא שם לפונט')
      return
    }
    if (!image) {
      alert('אנא בחר תמונה להעלאה')
      return
    }

    const newFontData = {
      fontName: name.trim(),
      ownerId: 1, 
      filePath: 'C:/Users/WIN 11/Desktop/project/projects/myfont.ttf', 
      permission: viewPermission
    }

    try {
      setIsSaving(true)
      const savedFont = await fontService.createFont(newFontData)
      const fontId = savedFont.id
      setStatus('PENDING')

      const socket = new SockJS('http://localhost:8080/ws-font-status')
      const stompClient = Stomp.over(socket)
      
      stompClient.connect({}, () => {
        stompClient.subscribe(`/topic/status/${fontId}`, (message) => {
          const newStatus = message.body
          console.log("React received message body:", newStatus)
          setStatus(newStatus)
          if (newStatus === 'COMPLETED') {
           setTimeout(() => {
            alert('הפונט נוצר בהצלחה!')
            navigate('/dashboard')
        }, 3000)
          }
        })
      })

    } catch (error) {
      alert('שגיאה ביצירת הפונט: ' + (error.message || 'שגיאה לא ידועה'))
      setIsSaving(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f8f9fa, #e9ecef)',
      padding: '3rem 1.5rem',
      direction: 'rtl',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '560px', 
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '16px',
        padding: '3rem 2.5rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ 
            fontSize: '1.875rem',
            color: '#1a1a1a',
            marginBottom: '0.5rem',
            fontWeight: '600',
            letterSpacing: '-0.02em'
          }}>
            יצירת פונט אישי
          </h1>
          <p style={{ 
            color: '#6c757d',
            fontSize: '0.9375rem',
            margin: 0,
            lineHeight: '1.5'
          }}>
            המר את כתב היד שלך לפונט דיגיטלי מותאם אישית
          </p>
        </div>

        {status && (
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            background: status === 'PROCESSING' ? '#fff8f0' : 
                       status === 'COMPLETED' ? '#f0f9f4' : 
                       status === 'FAILED' ? '#fef5f5' : '#f8f9fa',
            border: `1px solid ${
              status === 'PROCESSING' ? '#f0d9c0' : 
              status === 'COMPLETED' ? '#c6e8d5' : 
              status === 'FAILED' ? '#f5c6cb' : '#dee2e6'
            }`
          }}>
            <span style={{ 
              color: status === 'PROCESSING' ? '#c87d3a' : 
                     status === 'COMPLETED' ? '#2d7a4f' : 
                     status === 'FAILED' ? '#a94442' : '#495057',
              fontWeight: '500',
              fontSize: '0.9375rem'
            }}>
              {status === 'PENDING' && 'ממתין בתור...'}
              {status === 'PROCESSING' && 'מעבד את הפונט שלך...'}
              {status === 'COMPLETED' && 'הפונט נוצר בהצלחה'}
            </span>
          </div>
        )}

        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ 
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#495057',
            marginBottom: '0.5rem',
            letterSpacing: '0.01em'
          }}>
            שם הפונט
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="לדוגמה: כתב היד שלי"
            style={{ 
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.9375rem',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
              color: '#1a1a1a'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#8b9099'
              e.target.style.boxShadow = '0 0 0 3px rgba(139, 144, 153, 0.08)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#dee2e6'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ 
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#495057',
            marginBottom: '0.5rem',
            letterSpacing: '0.01em'
          }}>
            תמונת כתב יד
          </label>
          <div style={{
            position: 'relative',
            border: '1.5px dashed #cbd5e0',
            borderRadius: '8px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            background: '#fafbfc',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#8b9099'
            e.currentTarget.style.background = '#f5f7f9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e0'
            e.currentTarget.style.background = '#fafbfc'
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={e => setImage(e.target.files[0])}
              style={{ 
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            <div style={{ pointerEvents: 'none' }}>
              <svg 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#8b9099" 
                strokeWidth="1.5"
                style={{ margin: '0 auto 0.75rem' }}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p style={{ 
                color: image ? '#1a1a1a' : '#6c757d', 
                fontSize: '0.875rem', 
                margin: 0,
                fontWeight: image ? '500' : '400'
              }}>
                {image ? image.name : 'לחץ לבחירת קובץ או גרור לכאן'}
              </p>
              {!image && (
                <p style={{ 
                  color: '#adb5bd', 
                  fontSize: '0.8125rem', 
                  margin: '0.25rem 0 0',
                }}>
                  PNG, JPG עד 10MB
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2.25rem' }}>
          <label style={{ 
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#495057',
            marginBottom: '0.5rem',
            letterSpacing: '0.01em'
          }}>
            הגדרות פרטיות
          </label>
          <select
            value={viewPermission}
            onChange={e => setViewPermission(e.target.value)}
            style={{ 
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.9375rem',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              outline: 'none',
              background: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              color: '#1a1a1a',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236c757d\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left 1rem center',
              backgroundSize: '1.25rem',
              paddingLeft: '2.5rem'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#8b9099'
              e.target.style.boxShadow = '0 0 0 3px rgba(139, 144, 153, 0.08)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#dee2e6'
              e.target.style.boxShadow = 'none'
            }}
          >
            <option value="public">ציבורי</option>
            <option value="private">פרטי</option>
            <option value="specific">לאנשים ספציפיים</option>
          </select>
        </div>

        <button
          onClick={handleSaveFont}
          disabled={isSaving}
          style={{
            width: '100%',
            padding: '0.875rem 1.5rem',
            fontSize: '0.9375rem',
            fontWeight: '500',
            background: isSaving ? '#adb5bd' : '#2c3e50',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            letterSpacing: '0.01em'
          }}
          onMouseEnter={(e) => {
            if (!isSaving) {
              e.target.style.background = '#1a252f'
              e.target.style.transform = 'translateY(-1px)'
              e.target.style.boxShadow = '0 4px 12px rgba(44, 62, 80, 0.15)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isSaving) {
              e.target.style.background = '#2c3e50'
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }
          }}
        >
          {isSaving ? 'מעבד...' : 'צור פונט'}
        </button>

        <p style={{
          marginTop: '1.5rem',
          fontSize: '0.8125rem',
          color: '#adb5bd',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          תהליך היצירה עשוי לקחת מספר דקות
        </p>
      </div>
    </div>
  )
}