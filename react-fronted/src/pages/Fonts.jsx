// import React, { useEffect, useState } from 'react'
// import { getAllFonts } from '../features/fonts/services/fontService'
// import FontCard from '../features/fonts/components/FontCard'
// import FiltersBar from '../features/fonts/components/FiltersBar'

// export default function FontsPage() {
//   const [fonts, setFonts] = useState([])
//   const [filteredFonts, setFilteredFonts] = useState([])
//   const [filters, setFilters] = useState({ geometric: '', content: '', expression: '' })

//   const loadFonts = async () => {
//     try {
//       const data = await getAllFonts()
//       // השרת כבר מחזיר רק פונטים מורשים, אז פשוט נשמור אותם
//       setFonts(data)
//       setFilteredFonts(data)
//     } catch (error) {
//       console.error("שגיאה בטעינת הפונטים:", error)
//     }
//   }

//   useEffect(() => {
//     loadFonts()
//   }, [])

//   useEffect(() => {
//     let result = [...fonts]
//     if (filters.geometric) result = result.filter(f => f.geometricStyle === filters.geometric)
//     if (filters.content) result = result.filter(f => f.contentStyle === filters.content)
//     if (filters.expression) result = result.filter(f => f.expressionStyle === filters.expression)
//     setFilteredFonts(result)
//   }, [filters, fonts])

//   const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })
//   const handleClearFilters = () => setFilters({ geometric: '', content: '', expression: '' })
  
//   const uniqueStyles = (key) => [...new Set(fonts.map(f => f[key]).filter(Boolean))]

//   return (
//     <div style={{ padding: '20px', direction: 'rtl' }}>
//       <h2>ספריית הפונטים</h2>
//       <FiltersBar 
//         filters={filters} 
//         onChange={handleFilterChange} 
//         onClear={handleClearFilters} 
//         uniqueStyles={uniqueStyles} 
//       />
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
//         {filteredFonts.length > 0 ? (
//           filteredFonts.map(f => (
//             <FontCard key={f.id} font={f} />
//           ))
//         ) : (
//           <p>לא נמצאו פונטים להצגה</p>
//         )}
//       </div>
//     </div>
//   )
// }

import React, { useEffect, useState } from 'react'
import { getAllFonts } from '../features/fonts/services/fontService'
import FontCard from '../features/fonts/components/FontCard'
import FiltersBar from '../features/fonts/components/FiltersBar'

// ====== ערכת העיצוב (Hand2Font) ======
const T = {
  ink: '#241C15', inkSoft: '#736A5E', inkFaint: '#A79E90', hair: '#EBE4D7',
  fontSans: "'Assistant', sans-serif", fontSerif: "'Frank Ruhl Libre', serif",
}

export default function FontsPage() {
  const [fonts, setFonts] = useState([])
  const [filteredFonts, setFilteredFonts] = useState([])
  const [filters, setFilters] = useState({ geometric: '', content: '', expression: '' })

  const loadFonts = async () => {
    try {
      const data = await getAllFonts()
      setFonts(data)
      setFilteredFonts(data)
    } catch (error) {
      console.error("שגיאה בטעינת הפונטים:", error)
    }
  }

  useEffect(() => {
    // טעינת גופני המערכת (פעם אחת)
    if (!document.getElementById('h2f-fonts')) {
      const link = document.createElement('link')
      link.id = 'h2f-fonts'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&family=Frank+Ruhl+Libre:wght@400;500;700&family=Gveret+Levin&display=swap'
      document.head.appendChild(link)
    }
    loadFonts()
  }, [])

  useEffect(() => {
    let result = [...fonts]
    if (filters.geometric) result = result.filter(f => f.geometricStyle === filters.geometric)
    if (filters.content) result = result.filter(f => f.contentStyle === filters.content)
    if (filters.expression) result = result.filter(f => f.expressionStyle === filters.expression)
    setFilteredFonts(result)
  }, [filters, fonts])

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })
  const handleClearFilters = () => setFilters({ geometric: '', content: '', expression: '' })

  const uniqueStyles = (key) => [...new Set(fonts.map(f => f[key]).filter(Boolean))]

  return (
    <div style={{ padding: '2.5rem 1.5rem', direction: 'rtl', maxWidth: '1100px', margin: '0 auto', fontFamily: T.fontSans, color: T.ink }}>
      <h1 style={{ fontFamily: T.fontSerif, fontWeight: 500, fontSize: '2rem', letterSpacing: '-.5px', marginBottom: '0.4rem' }}>
        ספריית הפונטים
      </h1>
      <p style={{ color: T.inkSoft, fontSize: '1rem', marginBottom: '1.75rem' }}>
        גלו פונטים שנוצרו מכתב יד אמיתי — וסננו לפי הסגנון שמתאים לכם.
      </p>

      <FiltersBar
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        uniqueStyles={uniqueStyles}
      />

      {filteredFonts.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '8px' }}>
          {filteredFonts.map(f => (
            <FontCard key={f.id} font={f} />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem', color: T.inkFaint,
          background: '#FCFAF6', border: `1px solid ${T.hair}`, borderRadius: '14px', marginTop: '8px',
        }}>
          לא נמצאו פונטים להצגה
        </div>
      )}
    </div>
  )
}
