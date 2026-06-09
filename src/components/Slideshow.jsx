import { useState, useEffect } from 'react'
import './Slideshow.css'

export default function Slideshow({ announcements = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (announcements.length === 0) return

    const currentAnnouncement = announcements[currentIndex]
    const duration = (currentAnnouncement.duration || 5) * 1000

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, duration)

    return () => clearTimeout(timer)
  }, [currentIndex, announcements])

  if (announcements.length === 0) {
    return (
      <div className="tv-slideshow empty">
        <p>No announcements available</p>
      </div>
    )
  }

  const current = announcements[currentIndex]

  return (
    <div className="tv-slideshow">
      <img
        src={current.image}
        alt={current.title}
        className="slideshow-image"
        onError={(e) => {
          e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23ccc%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23666%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3EImage not found%3C/text%3E%3C/svg%3E'
        }}
      />
      
      <div className="slideshow-overlay">
        <h2 className="slideshow-title">{current.title}</h2>
      </div>

      <div className="slideshow-indicators">
        {announcements.map((_, idx) => (
          <button
            key={idx}
            className={`indicator ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to announcement ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
