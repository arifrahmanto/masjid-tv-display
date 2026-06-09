// src/components/RunningText.jsx
import { useState, useEffect } from 'react'
import './RunningText.css'

export default function RunningText({ announcements = [], config = {} }) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    if (announcements.length === 0) {
      setDisplayText('Selamat datang di ' + (config.masjidName || 'masjid kami'))
      return
    }

    const texts = announcements.map(ann => ann.title).join(' • ')
    const fullText = '🔔 ' + texts + ' • '
    setDisplayText(fullText + fullText) // Repeat for seamless loop
  }, [announcements, config])

  return (
    <div className="tv-footer">
      <div 
        className="running-text"
        style={{
          color: config.runningTextColor || '#ffffff',
          animationDuration: `${(displayText.length * 50) / 1000}s`
        }}
      >
        <span>{displayText}</span>
      </div>
    </div>
  )
}
