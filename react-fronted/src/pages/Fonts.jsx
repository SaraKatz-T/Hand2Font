import React, { useEffect, useState } from 'react'
import { getAllFonts } from '../features/fonts/services/fontService'
import FontCard from '../features/fonts/components/FontCard'
import FiltersBar from '../features/fonts/components/FiltersBar'

export default function FontsPage() {
  const [fonts, setFonts] = useState([])
  const [filteredFonts, setFilteredFonts] = useState([])
  const [filters, setFilters] = useState({ geometric: '', content: '', expression: '' })

  const loadFonts = async () => {
    try {
      const data = await getAllFonts()
      // השרת כבר מחזיר רק פונטים מורשים, אז פשוט נשמור אותם
      setFonts(data)
      setFilteredFonts(data)
    } catch (error) {
      console.error("שגיאה בטעינת הפונטים:", error)
    }
  }

  useEffect(() => {
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
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <h2>ספריית הפונטים</h2>
      <FiltersBar 
        filters={filters} 
        onChange={handleFilterChange} 
        onClear={handleClearFilters} 
        uniqueStyles={uniqueStyles} 
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
        {filteredFonts.length > 0 ? (
          filteredFonts.map(f => (
            <FontCard key={f.id} font={f} />
          ))
        ) : (
          <p>לא נמצאו פונטים להצגה</p>
        )}
      </div>
    </div>
  )
}