
import React from 'react'
import { X } from 'lucide-react'

// ====== ערכת העיצוב (Hand2Font) ======
const T = {
  surface: '#FFFFFF', ink: '#241C15', inkSoft: '#736A5E',
  hair: '#EBE4D7', hairStrong: '#DDD4C3',
  fontSans: "'Assistant', sans-serif",
}

const selectStyle = {
  padding: '10px 14px', borderRadius: '10px', border: `1px solid ${T.hairStrong}`,
  background: '#FCFAF6', color: T.ink, fontFamily: T.fontSans, fontSize: '0.9rem',
  cursor: 'pointer', outline: 'none', minWidth: '180px',
}

export default function FiltersBar({ filters, onChange, onClear, uniqueStyles }) {
  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', fontFamily: T.fontSans }}>
      <select name="geometric" value={filters.geometric} onChange={onChange} style={selectStyle}>
        <option value="">כל הסגנונות הגיאומטריים</option>
        {uniqueStyles('geometricStyle').map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <select name="content" value={filters.content} onChange={onChange} style={selectStyle}>
        <option value="">כל סגנונות התוכן</option>
        {uniqueStyles('contentStyle').map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <select name="expression" value={filters.expression} onChange={onChange} style={selectStyle}>
        <option value="">כל סגנונות ההבעה</option>
        {uniqueStyles('expressionStyle').map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <button
        onClick={onClear}
        style={{
          padding: '10px 18px', borderRadius: '10px', border: `1px solid ${T.hairStrong}`,
          background: 'transparent', color: T.ink, cursor: 'pointer', fontFamily: T.fontSans,
          fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px',
        }}
      >
        <X size={16} /> נקה סינון
      </button>
    </div>
  )
}
