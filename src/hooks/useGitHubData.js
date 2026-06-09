// src/hooks/useGitHubData.js
import { useState, useEffect } from 'react'
import { fetchJSON, fetchCSV } from '../utils/githubApi'
import { CacheManager } from '../utils/cacheManager'
import { CACHE_KEYS } from '../utils/constants'

export function useGitHubData() {
  const [config, setConfig] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [prayerTimes, setPrayerTimes] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAllData()
  }, [])

  async function loadAllData() {
    try {
      setLoading(true)
      setError(null)

      const [configData, announcementsData, prayerTimesData, scheduleData] = await Promise.all([
        loadConfig(),
        loadAnnouncements(),
        loadPrayerTimes(),
        loadSchedule()
      ])

      setConfig(configData)
      setAnnouncements(announcementsData)
      setPrayerTimes(prayerTimesData)
      setSchedule(scheduleData)
    } catch (err) {
      console.error('Failed to load data:', err)
      setError(err.message)
      // Load from cache on error
      loadFromCache()
    } finally {
      setLoading(false)
    }
  }

  async function loadConfig() {
    try {
      const data = await fetchJSON(CACHE_KEYS.CONFIG)
      await CacheManager.set(CACHE_KEYS.CONFIG, data)
      CacheManager.setLastUpdated(CACHE_KEYS.CONFIG)
      return data
    } catch (err) {
      const cached = await CacheManager.get(CACHE_KEYS.CONFIG)
      return cached ? JSON.parse(cached) : {}
    }
  }

  async function loadAnnouncements() {
    try {
      const data = await fetchJSON(CACHE_KEYS.ANNOUNCEMENTS)
      await CacheManager.set(CACHE_KEYS.ANNOUNCEMENTS, data)
      CacheManager.setLastUpdated(CACHE_KEYS.ANNOUNCEMENTS)
      return data.announcements || []
    } catch (err) {
      const cached = await CacheManager.get(CACHE_KEYS.ANNOUNCEMENTS)
      return cached ? JSON.parse(cached).announcements || [] : []
    }
  }

  async function loadPrayerTimes() {
    try {
      const data = await fetchCSV(CACHE_KEYS.PRAYER_TIMES)
      await CacheManager.set(CACHE_KEYS.PRAYER_TIMES, data)
      CacheManager.setLastUpdated(CACHE_KEYS.PRAYER_TIMES)
      return data.rows || []
    } catch (err) {
      const cached = await CacheManager.get(CACHE_KEYS.PRAYER_TIMES)
      return cached ? JSON.parse(cached).rows || [] : []
    }
  }

  async function loadSchedule() {
    try {
      const data = await fetchJSON(CACHE_KEYS.SCHEDULE)
      await CacheManager.set(CACHE_KEYS.SCHEDULE, data)
      CacheManager.setLastUpdated(CACHE_KEYS.SCHEDULE)
      return data.murottal || []
    } catch (err) {
      const cached = await CacheManager.get(CACHE_KEYS.SCHEDULE)
      return cached ? JSON.parse(cached).murottal || [] : []
    }
  }

  async function loadFromCache() {
    try {
      const configData = await CacheManager.get(CACHE_KEYS.CONFIG)
      const announcementsData = await CacheManager.get(CACHE_KEYS.ANNOUNCEMENTS)
      const prayerTimesData = await CacheManager.get(CACHE_KEYS.PRAYER_TIMES)
      const scheduleData = await CacheManager.get(CACHE_KEYS.SCHEDULE)

      setConfig(configData ? JSON.parse(configData) : null)
      setAnnouncements(announcementsData ? JSON.parse(announcementsData).announcements || [] : [])
      setPrayerTimes(prayerTimesData ? JSON.parse(prayerTimesData).rows || [] : [])
      setSchedule(scheduleData ? JSON.parse(scheduleData).murottal || [] : [])
    } catch (err) {
      console.error('Failed to load from cache:', err)
    }
  }

  return {
    config,
    announcements,
    prayerTimes,
    schedule,
    loading,
    error,
    refresh: loadAllData
  }
}
