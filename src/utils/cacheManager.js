// src/utils/cacheManager.js
import { CACHE_NAMES } from './constants'

export class CacheManager {
  static async set(key, value, isStatic = false) {
    const cacheName = isStatic ? CACHE_NAMES.STATIC : CACHE_NAMES.DYNAMIC
    try {
      const cache = await caches.open(cacheName)
      const response = new Response(
        typeof value === 'string' ? value : JSON.stringify(value),
        { headers: { 'Content-Type': 'application/json' } }
      )
      await cache.put(new Request(key), response)
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    } catch (err) {
      console.error('Cache set failed:', err)
    }
  }

  static async get(key) {
    try {
      // Try Cache API first
      const cache = await caches.open(CACHE_NAMES.DYNAMIC)
      const response = await cache.match(new Request(key))
      if (response) {
        return await response.text()
      }
    } catch (err) {
      console.error('Cache get failed:', err)
    }
    
    // Fall back to localStorage
    return localStorage.getItem(key)
  }

  static async clear() {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      )
      localStorage.clear()
    } catch (err) {
      console.error('Cache clear failed:', err)
    }
  }

  static getLastUpdated(key) {
    const timestamp = localStorage.getItem(`${key}:timestamp`)
    return timestamp ? new Date(parseInt(timestamp)) : null
  }

  static setLastUpdated(key) {
    localStorage.setItem(`${key}:timestamp`, Date.now().toString())
  }
}
