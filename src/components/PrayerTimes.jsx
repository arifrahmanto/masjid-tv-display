// src/components/PrayerTimes.jsx
import { usePrayerTimes } from '../hooks'
import './PrayerTimes.css'

const PRAYER_LABELS = {
  subuh: 'Subuh',
  duha: 'Duha',
  zuhur: 'Zuhur',
  asar: 'Asar',
  magrib: 'Magrib',
  isya: 'Isya'
}

export default function PrayerTimes({ prayerTimesData = [] }) {
  const { todayTimes, nextPrayer, countdown } = usePrayerTimes(prayerTimesData)

  return (
    <div className="tv-prayer-times">
      <div className="prayer-grid">
        {Object.entries(todayTimes).map(([key, time]) => (
          <div key={key} className="prayer-item">
            <p className="prayer-label">{PRAYER_LABELS[key]}</p>
            <p className="prayer-time">{time}</p>
          </div>
        ))}
      </div>

      <div className="next-prayer">
        {nextPrayer && (
          <>
            <p className="next-label">Sholat Berikutnya:</p>
            <p className="next-prayer-name">{PRAYER_LABELS[nextPrayer.name] || nextPrayer.name}</p>
            {!nextPrayer.isTomorrow && <p className="countdown">{countdown}</p>}
          </>
        )}
      </div>
    </div>
  )
}
