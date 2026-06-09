// src/hooks/usePrayerTimes.js
import { useState, useEffect } from 'react'
import { DISPLAYED_PRAYER_TIMES } from '../utils/constants'

export function usePrayerTimes(prayerTimesData) {
  const [todayTimes, setTodayTimes] = useState({})
  const [nextPrayer, setNextPrayer] = useState(null)
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    if (!prayerTimesData || prayerTimesData.length === 0) return

    const today = new Date()
    const todayDate = today.getDate()
    const todayData = prayerTimesData.find(row => parseInt(row.tanggal) === todayDate)

    if (!todayData) {
      console.warn('No prayer times for today')
      return
    }

    // Extract only displayed prayer times
    const times = {}
    DISPLAYED_PRAYER_TIMES.forEach(prayer => {
      times[prayer] = todayData[prayer]
    })
    setTodayTimes(times)
  }, [prayerTimesData])

  useEffect(() => {
    const interval = setInterval(() => {
      calculateNextPrayer()
    }, 1000)

    return () => clearInterval(interval)
  }, [todayTimes])

  function calculateNextPrayer() {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    let next = null
    for (const prayer of DISPLAYED_PRAYER_TIMES) {
      if (todayTimes[prayer] && todayTimes[prayer] > currentTime) {
        next = { name: prayer, time: todayTimes[prayer] }
        break
      }
    }

    if (!next) {
      // Next prayer is tomorrow
      setNextPrayer({ name: DISPLAYED_PRAYER_TIMES[0], time: 'Tomorrow', isTomorrow: true })
      setCountdown('')
      return
    }

    setNextPrayer(next)

    // Calculate countdown
    const [hours, minutes] = next.time.split(':').map(Number)
    const prayerDate = new Date()
    prayerDate.setHours(hours, minutes, 0, 0)
    
    const diff = prayerDate - now
    if (diff > 0) {
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown(`${h}h ${m}m ${s}s`)
    }
  }

  return { todayTimes, nextPrayer, countdown }
}
