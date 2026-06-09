// src/components/Header.jsx
import { useClock } from '../hooks'
import './Header.css'

export default function Header({ config = {} }) {
  const { gregorianDate, gregorianTime, hijriDate } = useClock()

  return (
    <header className="tv-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="mosque-name">{config.masjidName || 'Masjid'}</h1>
          <p className="mosque-location">{config.location || ''}</p>
        </div>
        
        <div className="header-center">
          <div className="clock">
            <p className="time">{gregorianTime}</p>
            <p className="date">{gregorianDate}</p>
          </div>
        </div>
        
        <div className="header-right">
          <div className="hijri-date">
            <p className="label">Tanggal Hijriah</p>
            <p className="date">{hijriDate}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
