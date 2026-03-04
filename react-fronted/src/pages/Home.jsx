import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // בדיקה אם המשתמש מחובר
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [])

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '3rem',
      padding: '2rem 0'
    }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 2rem'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          marginBottom: '1.5rem',
          fontWeight: 'bold',
          color: '#2c3e50'
        }}>
          יצירת פונטים מותאמים אישית
        </h1>
        <p style={{
          fontSize: '1.4rem',
          marginBottom: '2.5rem',
          color: '#7f8c8d',
          maxWidth: '700px',
          margin: '0 auto 2.5rem'
        }}>
          פלטפורמה מתקדמת ליצירת פונטים ייחודיים בקלות ובמהירות
        </p>
        
        {!isLoggedIn ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              padding: '1rem 2.5rem',
              background: '#3498db',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              הירשם עכשיו
            </Link>
            <Link to="/login" style={{
              padding: '1rem 2.5rem',
              background: 'transparent',
              color: '#3498db',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: '2px solid #3498db'
            }}>
              התחבר
            </Link>
          </div>
        ) : (
          < div></div>
        )}
      </section>

      {/* Features Section */}
      <section>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '2.5rem',
          color: '#2c3e50'
        }}>
          למה לבחור בנו?
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {/* Feature 1 */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center',
            transition: 'transform 0.3s'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}></div>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: '#2c3e50'
            }}>
              עיצוב מותאם אישית
            </h3>
            <p style={{
              color: '#7f8c8d',
              lineHeight: '1.6'
            }}>
              צור פונטים ייחודיים המשקפים את הסגנון שלך בדיוק
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}></div>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: '#2c3e50'
            }}>
              מהיר וקל לשימוש
            </h3>
            <p style={{
              color: '#7f8c8d',
              lineHeight: '1.6'
            }}>
              ממשק פשוט ואינטואיטיבי שמאפשר יצירה ,צפיה ושיתוף פונטים
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}></div>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: '#2c3e50'
            }}>
              מאובטח ומוצפן
            </h3>
            <p style={{
              color: '#7f8c8d',
              lineHeight: '1.6'
            }}>
              כל המידע מוצפן ומאובטח - הפונטים שלך בידיים בטוחות
            </p>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section style={{
        background: '#f8f9fa',
        padding: '3rem 2rem',
        borderRadius: '12px'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '2.5rem',
          color: '#2c3e50'
        }}>
          איך זה עובד?
        </h2>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {/* Step 1 */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            <div style={{
              minWidth: '60px',
              height: '60px',
              background: '#667eea',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              1
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#2c3e50' }}>
                הירשם למערכת
              </h3>
              <p style={{ color: '#7f8c8d' }}>
                צור חשבון חינם תוך פחות מדקה
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            <div style={{
              minWidth: '60px',
              height: '60px',
              background: '#667eea',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              2
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#2c3e50' }}>
                צור את הפונט שלך
              </h3>
              <p style={{ color: '#7f8c8d' }}>
                השתמש בכלי העיצוב הפשוטים שלנו
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            <div style={{
              minWidth: '60px',
              height: '60px',
              background: '#667eea',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              3
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#2c3e50' }}>
                הורד והשתמש
              </h3>
              <p style={{ color: '#7f8c8d' }}>
                הורד את הפונט ושלב אותו בפרויקטים שלך
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        background: '#2c3e50',
        borderRadius: '12px',
        color: 'white'
      }}>
        <h2 style={{
          fontSize: '2rem',
          marginBottom: '1rem'
        }}>
          מוכן להתחיל?
        </h2>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '2rem',
          opacity: 0.9
        }}>
          הצטרף לאלפי משתמשים שכבר יוצרים פונטים מדהימים
        </p>
        
        {!isLoggedIn ? (
          <Link to="/register" style={{
            padding: '1rem 3rem',
            background: '#3498db',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '1.2rem',
            fontWeight: '600',
            display: 'inline-block'
          }}>
            צור פונט חדש
          </Link>
        ) : (
          <Link to="/create" style={{
            padding: '1rem 3rem',
            background: '#3498db',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '1.2rem',
            fontWeight: '600',
            display: 'inline-block'
          }}>
            צור פונט חדש
          </Link>
        )}
      </section>
    </div>
  )
}