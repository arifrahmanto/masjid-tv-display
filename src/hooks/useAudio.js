// src/hooks/useAudio.js
import { useEffect, useRef, useState } from 'react'
import { CACHE_KEYS } from '../utils/constants'
import { CacheManager } from '../utils/cacheManager'
import { fetchAudio } from '../utils/githubApi'

export function useAudio(prayerTimes = [], schedule = []) {
  const audioRef = useRef(new Audio())
  const [isPlaying, setIsPlaying] = useState(false)
  const lastPlayedRef = useRef({})

  useEffect(() => {
    const checkAndPlayAudio = () => {
      checkTarhim()
      checkMurottal()
    }

    const interval = setInterval(checkAndPlayAudio, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [prayerTimes, schedule])

  async function checkTarhim() {
    if (!prayerTimes || prayerTimes.length === 0) return

    const now = new Date()
    const todayDate = now.getDate()
    const todayData = prayerTimes.find(row => parseInt(row.tanggal) === todayDate)

    if (!todayData) return

    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    // Check all prayers
    const prayerKeys = ['imsak', 'subuh', 'duha', 'zuhur', 'asar', 'magrib', 'isya']
    
    for (const prayerKey of prayerKeys) {
      if (!todayData[prayerKey]) continue

      const [prayerHour, prayerMinute] = todayData[prayerKey].split(':').map(Number)
      const prayerTime = new Date()
      prayerTime.setHours(prayerHour, prayerMinute, 0, 0)
      
      const sixMinutesBefore = new Date(prayerTime.getTime() - 6 * 60000)
      const tarhimTime = `${String(sixMinutesBefore.getHours()).padStart(2, '0')}:${String(sixMinutesBefore.getMinutes()).padStart(2, '0')}`

      if (currentTime === tarhimTime && !lastPlayedRef.current[`tarhim_${todayDate}_${prayerKey}`]) {
        await playAudio(CACHE_KEYS.TARHIM)
        lastPlayedRef.current[`tarhim_${todayDate}_${prayerKey}`] = true
      }
    }
  }

  async function checkMurottal() {
    if (!schedule || schedule.length === 0) return

    const now = new Date()
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()]
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    for (const murottal of schedule) {
      const scheduleDay = murottal.day.toLowerCase()
      const scheduleTime = murottal.time

      if (dayName === scheduleDay && currentTime === scheduleTime && !lastPlayedRef.current[`murottal_${currentTime}`]) {
        await playAudio(CACHE_KEYS.MUROTTAL)
        lastPlayedRef.current[`murottal_${currentTime}`] = true
        
        // Reset after 24 hours
        setTimeout(() => {
          delete lastPlayedRef.current[`murottal_${currentTime}`]
        }, 24 * 60 * 60 * 1000)
      }
    }
  }

  async function playAudio(audioKey) {
    try {
      let blob

      // Try to get from cache first
      const cached = await CacheManager.get(audioKey)
      if (cached) {
        blob = new Blob([cached], { type: 'audio/mpeg' })
      } else {
        // Fetch from GitHub
        const response = await fetchAudio(audioKey)
        blob = await response.blob()
        await CacheManager.set(audioKey, blob)
      }

      const url = URL.createObjectURL(blob)
      audioRef.current.src = url
      audioRef.current.play().catch(err => console.error('Audio play failed:', err))
      setIsPlaying(true)

      audioRef.current.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Audio playback error:', err)
    }
  }

  function stopAudio() {
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsPlaying(false)
  }

  function setVolume(vol) {
    audioRef.current.volume = Math.max(0, Math.min(1, vol))
  }

  return { isPlaying, stopAudio, setVolume }
}
