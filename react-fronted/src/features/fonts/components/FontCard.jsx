import React from 'react'
import { downloadFont } from '../services/fontService'

const FontCard = ({ font }) => (
  <div style={styles.card}>
    <h3>{font.fontName}</h3>
    <p><strong>יוצר:</strong> {font.ownerName}</p>
    <div style={styles.tags}>
      <span style={styles.tag}>{font.geometricStyle}</span>
      <span style={styles.tag}>{font.contentStyle}</span>
      <span style={styles.tag}>{font.expressionStyle}</span>
    </div>
    <button onClick={() => downloadFont(font.id, font.fontName)} style={styles.button}>
      הורד פונט ⬇
    </button>
  </div>
)

const styles = {
  card: { border: '1px solid #ddd', borderRadius: '8px', padding: '16px', margin: '10px', width: '250px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center', backgroundColor: '#fff' },
  tags: { display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '10px', fontSize: '12px', color: '#666' },
  tag: { backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' },
  button: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }
}

export default FontCard
