// src/hooks/useClock.js
import { useState, useEffect } from 'react'
import { convertToHijri, formatGregorianDate, formatTime } from '../utils/hijriDate'

export function useClock() {
  const [gregorianDate, setGregorianDate] = useState('')
  const [gregorianTime, setGregorianTime] = useState('')
  const [hijriDate, setHijriDate] = useState('')

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setGregorianDate(formatGregorianDate(now))
      setGregorianTime(formatTime(now))
      const hijri = convertToHijri(now)
      setHijriDate(hijri.formatted)
    }

    updateClock() // Initial call
    const interval = setInterval(updateClock, 1000)

    return () => clearInterval(interval)
  }, [])

  return { gregorianDate, gregorianTime, hijriDate }
}
