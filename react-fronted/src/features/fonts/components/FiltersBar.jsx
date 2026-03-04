import React from 'react'

export default function FiltersBar({ filters, onChange, onClear, uniqueStyles }) {
  return (
    <div style={{ display:'flex', gap:'15px', marginBottom:'20px', flexWrap:'wrap' }}>
      <select name="geometric" value={filters.geometric} onChange={onChange} style={{ padding:'0.5rem', borderRadius:'6px', border:'1px solid #ccc' }}>
        <option value="">כל הסגנונות הגיאומטריים</option>
        {uniqueStyles('geometricStyle').map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <select name="content" value={filters.content} onChange={onChange} style={{ padding:'0.5rem', borderRadius:'6px', border:'1px solid #ccc' }}>
        <option value="">כל סגנונות התוכן</option>
        {uniqueStyles('contentStyle').map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <select name="expression" value={filters.expression} onChange={onChange} style={{ padding:'0.5rem', borderRadius:'6px', border:'1px solid #ccc' }}>
        <option value="">כל סגנונות ההבעה</option>
        {uniqueStyles('expressionStyle').map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <button onClick={onClear} style={{ padding:'0.5rem 1rem', borderRadius:'6px', border:'none', background:'#333', color:'white', cursor:'pointer' }}>
        נקה סינון
      </button>
    </div>
  )
}
