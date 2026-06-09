# Masjid TV Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack mosque display system with real-time admin management: a React TV display app showing prayer times, announcements, and audio; plus a Next.js admin panel for managing content via GitHub.

**Architecture:** TV Display reads data (config.json, announcements.json, prayer-times.csv, schedule.json) and audio files from GitHub raw content, caches everything via Service Worker + Local Storage for offline resilience, updates on manual refresh. Admin Panel uses GitHub OAuth to authenticate collaborators, provides forms to edit content, and commits changes directly to GitHub repo.

**Tech Stack:** 
- TV Display: React, Vite, Service Worker, Local Storage, HTML5 Audio API, hijri-date library, GitHub raw API
- Admin Panel: Next.js, GitHub OAuth (Octokit), GitHub API
- Both: GitHub Pages for deployment, GitHub repo for data storage

---

## File Structure

```
masjid-tv-display/
├── package.json (root - shared dependencies)
├── docs/superpowers/specs/2026-06-09-masjid-tv-display-design.md
├── docs/superpowers/plans/2026-06-09-masjid-tv-display-plan.md
│
├── TV Display App (src/)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Slideshow.jsx
│   │   │   ├── PrayerTimes.jsx
│   │   │   ├── RunningText.jsx
│   │   │   └── AudioController.jsx
│   │   ├── hooks/
│   │   │   ├── useGitHubData.js (fetch/cache data from GitHub)
│   │   │   ├── usePrayerTimes.js (parse CSV, calculate timings)
│   │   │   ├── useAudio.js (Tarhim & Murottal playback)
│   │   │   └── useClock.js (real-time clock & Hijri conversion)
│   │   ├── utils/
│   │   │   ├── githubApi.js (GitHub raw content fetching)
│   │   │   ├── hijriDate.js (Gregorian ↔ Hijri conversion)
│   │   │   ├── cacheManager.js (Service Worker + Local Storage)
│   │   │   └── constants.js (GitHub URLs, defaults)
│   │   ├── service-worker.js (caching, offline support)
│   │   ├── App.jsx (layout: header/slideshow/prayer-times/footer)
│   │   ├── index.css (full-screen responsive styling)
│   │   └── main.jsx
│   ├── public/
│   │   ├── manifest.json (for PWA)
│   │   └── favicon.ico
│   ├── vite.config.js
│   ├── package.json
│
├── Admin Panel (admin/)
│   ├── pages/
│   │   ├── index.js (dashboard)
│   │   ├── config.js (edit config.json)
│   │   ├── announcements.js (manage announcements)
│   │   ├── schedule.js (manage murottal schedule)
│   │   └── api/
│   │       ├── auth/[...nextauth].js (GitHub OAuth)
│   │       ├── config.js (read/write config.json)
│   │       ├── announcements.js (CRUD announcements)
│   │       └── publish.js (commit to GitHub)
│   ├── components/
│   │   ├── AuthProvider.jsx (session wrapper)
│   │   ├── ProtectedPage.jsx (auth guard)
│   │   ├── ConfigForm.jsx
│   │   ├── AnnouncementForm.jsx
│   │   ├── ScheduleForm.jsx
│   │   └── PublishButton.jsx
│   ├── utils/
│   │   ├── githubApi.js (Octokit client for commits)
│   │   └── constants.js (repo owner/name)
│   ├── styles/globals.css
│   ├── next.config.js
│   ├── package.json
│
├── Data Repository (public-data/) - shared via GitHub raw
│   ├── config.json
│   ├── announcements.json
│   ├── prayer-times.csv
│   ├── schedule.json
│   ├── images/
│   │   └── (announcement images)
│   └── audio/
│       ├── tarhim.mp3
│       └── murottal.mp3
│
└── .github/
    └── workflows/
        └── build-deploy.yml (CI/CD for GitHub Pages)
```

---

## Phase 1: Project Setup & Infrastructure

### Task 1: Initialize Monorepo

**Files:**
- Create: `package.json` (root)
- Create: `docs/superpowers/plans/2026-06-09-masjid-tv-display-plan.md` (this file)

- [ ] **Step 1: Initialize git repo and root package.json**

```bash
cd d:\Riset\Test
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

Create `package.json`:
```json
{
  "name": "masjid-tv-display",
  "version": "1.0.0",
  "description": "Mosque TV Display with Admin Panel",
  "private": true,
  "scripts": {
    "dev:tv": "cd src && npm run dev",
    "dev:admin": "cd admin && npm run dev",
    "build:tv": "cd src && npm run build",
    "build:admin": "cd admin && npm run build"
  }
}
```

- [ ] **Step 2: Create directory structure**

```bash
mkdir -p src/components src/hooks src/utils src/public
mkdir -p admin/pages admin/api admin/components admin/utils admin/styles
mkdir -p public-data/images public-data/audio
mkdir -p .github/workflows
```

- [ ] **Step 3: Initialize git and make first commit**

```bash
git add .
git commit -m "chore: initialize monorepo structure"
```

---

## Phase 2: TV Display App - Core Setup

### Task 2: Set Up Vite + React for TV Display

**Files:**
- Create: `src/package.json`
- Create: `src/vite.config.js`
- Create: `src/main.jsx`
- Create: `src/index.css`

- [ ] **Step 1: Create TV display package.json**

```json
{
  "name": "masjid-tv-display",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "hijri-date": "^3.4.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.9"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    port: 5173
  }
})
```

- [ ] **Step 3: Create main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.error('Service Worker registration failed:', err))
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#2d5016">
  <title>Masjid TV Display</title>
  <link rel="manifest" href="/manifest.json">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 5: Create index.css (full-screen responsive)**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

body {
  background: #fff;
  color: #000;
  -webkit-user-select: none;
  user-select: none;
}

/* Full-screen TV display layout */
#root {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.tv-header { height: 15vh; }
.tv-slideshow { height: 55vh; }
.tv-prayer-times { height: 20vh; }
.tv-footer { height: 10vh; }

/* Responsive text scaling for large screens */
@media (min-width: 1920px) {
  body {
    font-size: 1.5rem;
  }
}

@media (max-width: 1280px) {
  body {
    font-size: 0.9rem;
  }
}
```

- [ ] **Step 6: Create public/manifest.json (PWA)**

```json
{
  "name": "Masjid TV Display",
  "short_name": "Masjid TV",
  "description": "Mosque prayer times and announcements display",
  "start_url": "/",
  "display": "fullscreen",
  "orientation": "landscape",
  "theme_color": "#2d5016",
  "background_color": "#ffffff"
}
```

- [ ] **Step 7: npm install and commit**

```bash
cd src
npm install
cd ..
git add src/package.json src/package-lock.json src/vite.config.js src/main.jsx src/index.css src/index.html src/public/manifest.json
git commit -m "feat: setup Vite + React for TV display"
```

---

### Task 3: Implement Utility Functions

**Files:**
- Create: `src/utils/constants.js`
- Create: `src/utils/githubApi.js`
- Create: `src/utils/hijriDate.js`
- Create: `src/utils/cacheManager.js`

- [ ] **Step 1: Create constants.js**

```javascript
// src/utils/constants.js
export const GITHUB_REPO_OWNER = 'your-username'
export const GITHUB_REPO_NAME = 'masjid-tv-display'
export const GITHUB_BRANCH = 'main'
export const GITHUB_DATA_PATH = 'public-data'

export const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/${GITHUB_DATA_PATH}`

export const CACHE_NAMES = {
  STATIC: 'masjid-tv-static-v1',
  DYNAMIC: 'masjid-tv-dynamic-v1'
}

export const CACHE_KEYS = {
  CONFIG: 'config.json',
  ANNOUNCEMENTS: 'announcements.json',
  PRAYER_TIMES: 'prayer-times.csv',
  SCHEDULE: 'schedule.json',
  TARHIM: 'audio/tarhim.mp3',
  MUROTTAL: 'audio/murottal.mp3'
}

export const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-awwal', 'Rabi al-thani',
  'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
]

export const PRAYER_TIMES_CSV_HEADER = ['tanggal', 'bulan', 'imsak', 'subuh', 'terbit', 'duha', 'zuhur', 'asar', 'magrib', 'isya']
export const DISPLAYED_PRAYER_TIMES = ['subuh', 'duha', 'zuhur', 'asar', 'magrib', 'isya']
```

- [ ] **Step 2: Create githubApi.js**

```javascript
// src/utils/githubApi.js
import { GITHUB_RAW_URL, CACHE_KEYS } from './constants'

export async function fetchFromGitHub(fileKey) {
  const url = `${GITHUB_RAW_URL}/${fileKey}`
  
  try {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.text()
  } catch (error) {
    console.error(`Failed to fetch ${fileKey}:`, error)
    throw error
  }
}

export async function fetchJSON(fileKey) {
  const data = await fetchFromGitHub(fileKey)
  return JSON.parse(data)
}

export async function fetchCSV(fileKey) {
  const data = await fetchFromGitHub(fileKey)
  return parseCSV(data)
}

export function parseCSV(csvString) {
  const lines = csvString.trim().split('\n')
  const header = lines[0].split(',').map(h => h.trim())
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    const obj = {}
    header.forEach((key, idx) => {
      obj[key] = values[idx]
    })
    return obj
  })
  return { header, rows }
}

export async function fetchAudio(fileKey) {
  const url = `${GITHUB_RAW_URL}/${fileKey}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`)
  return response
}
```

- [ ] **Step 3: Create hijriDate.js**

```javascript
// src/utils/hijriDate.js
import HijriDate from 'hijri-date'
import { HIJRI_MONTHS } from './constants'

export function convertToHijri(date = new Date()) {
  const hijri = new HijriDate(date)
  const day = hijri.getDate()
  const month = hijri.getMonth() + 1
  const year = hijri.getFullYear()
  
  return {
    day,
    month,
    year,
    monthName: HIJRI_MONTHS[month - 1],
    formatted: `${day} ${HIJRI_MONTHS[month - 1]} ${year} H`
  }
}

export function formatGregorianDate(date = new Date()) {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  
  const dayName = days[date.getDay()]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  
  return `${dayName}, ${day} ${month} ${year}`
}

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false
  })
}
```

- [ ] **Step 4: Create cacheManager.js**

```javascript
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
```

- [ ] **Step 5: npm install hijri-date and commit**

```bash
cd src
npm install hijri-date
cd ..
git add src/utils/
git commit -m "feat: add utility functions (GitHub API, Hijri date, cache manager)"
```

---

### Task 4: Implement Hooks (Data Fetching, Prayer Times, Clock)

**Files:**
- Create: `src/hooks/useGitHubData.js`
- Create: `src/hooks/usePrayerTimes.js`
- Create: `src/hooks/useClock.js`

- [ ] **Step 1: Create useGitHubData.js**

```javascript
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
```

- [ ] **Step 2: Create usePrayerTimes.js**

```javascript
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
```

- [ ] **Step 3: Create useClock.js**

```javascript
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
```

- [ ] **Step 4: Create hooks index and commit**

```bash
# Create src/hooks/index.js
cat > src/hooks/index.js << 'EOF'
export { useGitHubData } from './useGitHubData'
export { usePrayerTimes } from './usePrayerTimes'
export { useClock } from './useClock'
EOF

cd src
git add hooks/
cd ..
git commit -m "feat: implement custom hooks for data, prayer times, and clock"
```

---

### Task 5: Create Component - Header

**Files:**
- Create: `src/components/Header.jsx`

- [ ] **Step 1: Create Header.jsx**

```jsx
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
```

- [ ] **Step 2: Create Header.css**

```css
/* src/components/Header.css */
.tv-header {
  background: linear-gradient(135deg, #2d5016 0%, #1a3009 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3px solid #ffaa00;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.header-content {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-left {
  flex: 1;
}

.mosque-name {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  line-height: 1.2;
}

.mosque-location {
  font-size: 1.2rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
}

.header-center {
  flex: 1;
  text-align: center;
}

.clock {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.clock .time {
  font-size: 3rem;
  font-weight: bold;
  margin: 0;
  font-family: 'Courier New', monospace;
}

.clock .date {
  font-size: 1.3rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.95;
}

.header-right {
  flex: 1;
  text-align: right;
}

.hijri-date {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.hijri-date .label {
  font-size: 1rem;
  margin: 0;
  opacity: 0.85;
}

.hijri-date .date {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0.3rem 0 0 0;
}

@media (max-width: 1920px) {
  .mosque-name {
    font-size: 2rem;
  }
  
  .clock .time {
    font-size: 2.2rem;
  }
}

@media (max-width: 1280px) {
  .mosque-name {
    font-size: 1.4rem;
  }
  
  .clock .time {
    font-size: 1.5rem;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.*
git commit -m "feat: implement Header component"
```

---

### Task 6: Create Component - Slideshow

**Files:**
- Create: `src/components/Slideshow.jsx`
- Create: `src/components/Slideshow.css`

- [ ] **Step 1: Create Slideshow.jsx**

```jsx
// src/components/Slideshow.jsx
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
```

- [ ] **Step 2: Create Slideshow.css**

```css
/* src/components/Slideshow.css */
.tv-slideshow {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.tv-slideshow.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #999;
}

.slideshow-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease-in-out;
}

.slideshow-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
  padding: 2rem;
  display: flex;
  align-items: flex-end;
}

.slideshow-title {
  color: white;
  font-size: 2rem;
  margin: 0;
  font-weight: bold;
}

.slideshow-indicators {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 10;
}

.indicator {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  cursor: pointer;
  transition: background 0.3s;
}

.indicator.active {
  background: white;
}

@media (max-width: 1920px) {
  .slideshow-title {
    font-size: 1.5rem;
  }
  
  .indicator {
    width: 1.2rem;
    height: 1.2rem;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Slideshow.*
git commit -m "feat: implement Slideshow component"
```

---

### Task 7: Create Component - Prayer Times

**Files:**
- Create: `src/components/PrayerTimes.jsx`
- Create: `src/components/PrayerTimes.css`

- [ ] **Step 1: Create PrayerTimes.jsx**

```jsx
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
```

- [ ] **Step 2: Create PrayerTimes.css**

```css
/* src/components/PrayerTimes.css */
.tv-prayer-times {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
  border-top: 3px solid #ffaa00;
  border-bottom: 1px solid #ddd;
}

.prayer-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
}

.prayer-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #2d5016;
}

.prayer-label {
  font-size: 1rem;
  font-weight: bold;
  color: #2d5016;
  margin: 0 0 0.5rem 0;
}

.prayer-time {
  font-size: 1.5rem;
  font-weight: bold;
  color: #000;
  margin: 0;
  font-family: 'Courier New', monospace;
}

.next-prayer {
  background: #2d5016;
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  min-width: 200px;
}

.next-label {
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
}

.next-prayer-name {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.countdown {
  font-size: 1.3rem;
  color: #ffaa00;
  margin: 0.5rem 0 0 0;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

@media (max-width: 1920px) {
  .prayer-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .prayer-time {
    font-size: 1.2rem;
  }
  
  .next-prayer-name {
    font-size: 1.4rem;
  }
}

@media (max-width: 1280px) {
  .tv-prayer-times {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .prayer-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PrayerTimes.*
git commit -m "feat: implement PrayerTimes component"
```

---

### Task 8: Create Component - Running Text Footer

**Files:**
- Create: `src/components/RunningText.jsx`
- Create: `src/components/RunningText.css`

- [ ] **Step 1: Create RunningText.jsx**

```jsx
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
```

- [ ] **Step 2: Create RunningText.css**

```css
/* src/components/RunningText.css */
.tv-footer {
  background: #2d5016;
  color: white;
  padding: 0.5rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  border-top: 3px solid #ffaa00;
}

.running-text {
  display: inline-block;
  white-space: nowrap;
  font-size: 1.5rem;
  font-weight: bold;
  animation: scroll-left linear infinite;
}

@keyframes scroll-left {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

@media (max-width: 1280px) {
  .running-text {
    font-size: 1rem;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/RunningText.*
git commit -m "feat: implement RunningText component"
```

---

### Task 9: Create Audio Controller Hook

**Files:**
- Create: `src/hooks/useAudio.js`

- [ ] **Step 1: Create useAudio.js**

```javascript
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
```

- [ ] **Step 2: Update hooks/index.js**

```bash
cat >> src/hooks/index.js << 'EOF'
export { useAudio } from './useAudio'
EOF

git add src/hooks/
git commit -m "feat: implement useAudio hook for Tarhim and Murottal playback"
```

---

### Task 10: Create Service Worker for Offline Support

**Files:**
- Create: `src/service-worker.js`

- [ ] **Step 1: Create service-worker.js**

```javascript
// src/service-worker.js
const CACHE_NAMES = {
  STATIC: 'masjid-tv-static-v1',
  DYNAMIC: 'masjid-tv-dynamic-v1'
}

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
]

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC).then((cache) => {
      console.log('[Service Worker] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAMES.STATIC && cacheName !== CACHE_NAMES.DYNAMIC) {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // GitHub API requests - network first, then cache
  if (url.hostname === 'raw.githubusercontent.com' || url.hostname === 'api.github.com') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cache = caches.open(CACHE_NAMES.DYNAMIC)
            cache.then((c) => c.put(request, response.clone()))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAMES.DYNAMIC).then((cache) => {
          cache.put(request, responseToCache)
        })

        return response
      })
    })
      .catch(() => new Response('Offline'))
  )
})
```

- [ ] **Step 2: Update main.jsx to properly register Service Worker**

```bash
# Service Worker registration already done in Task 2, Step 3
# Just verify it's there
git add src/service-worker.js
git commit -m "feat: add Service Worker for offline support and caching"
```

---

### Task 11: Create Main App Component

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Create App.jsx**

```jsx
// src/App.jsx
import { useGitHubData } from './hooks'
import Header from './components/Header'
import Slideshow from './components/Slideshow'
import PrayerTimes from './components/PrayerTimes'
import RunningText from './components/RunningText'
import { useAudio } from './hooks/useAudio'
import './App.css'

export default function App() {
  const { config, announcements, prayerTimes, schedule, loading, error, refresh } = useGitHubData()
  
  // Initialize audio controller
  useAudio(prayerTimes, schedule)

  return (
    <div className="app">
      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
          <button onClick={refresh}>Refresh</button>
        </div>
      )}

      <Header config={config} />
      <Slideshow announcements={announcements} />
      <PrayerTimes prayerTimesData={prayerTimes} />
      <RunningText announcements={announcements} config={config} />

      {loading && (
        <div className="loading-overlay">
          <p>Loading...</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create App.css**

```css
/* src/App.css */
.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.error-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #d32f2f;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.error-banner p {
  margin: 0;
}

.error-banner button {
  background: white;
  color: #d32f2f;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s;
}

.error-banner button:hover {
  transform: scale(1.05);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  font-size: 2rem;
  color: white;
}

.loading-overlay p {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

- [ ] **Step 3: Update main.jsx to add keyboard shortcuts**

```javascript
// Add this to src/main.jsx after ReactDOM.createRoot

document.addEventListener('keydown', (event) => {
  if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
    event.preventDefault()
    window.location.reload()
  }
  
  // Alt+R for manual data refresh
  if (event.altKey && event.key === 'r') {
    event.preventDefault()
    // Dispatch custom event to trigger refresh in App
    window.dispatchEvent(new CustomEvent('app:refresh'))
  }
})
```

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/App.css src/main.jsx
git commit -m "feat: create main App component with layout and error handling"
```

---

### Task 12: Create Sample Data Files

**Files:**
- Create: `public-data/config.json`
- Create: `public-data/announcements.json`
- Create: `public-data/prayer-times.csv`
- Create: `public-data/schedule.json`

- [ ] **Step 1: Create config.json**

```bash
cat > public-data/config.json << 'EOF'
{
  "masjidName": "Masjid Al-Ikhlas",
  "location": "Jakarta, Indonesia",
  "primaryColor": "#2d5016",
  "secondaryColor": "#ffffff",
  "textColor": "#000000",
  "runningTextColor": "#ffffff",
  "runningTextSpeed": "normal"
}
EOF
```

- [ ] **Step 2: Create announcements.json**

```bash
cat > public-data/announcements.json << 'EOF'
{
  "announcements": [
    {
      "id": 1,
      "title": "Pengumuman Penting",
      "image": "https://via.placeholder.com/1920x1080?text=Pengumuman+1",
      "duration": 5
    },
    {
      "id": 2,
      "title": "Acara Khusus Bulan Ramadan",
      "image": "https://via.placeholder.com/1920x1080?text=Pengumuman+2",
      "duration": 5
    },
    {
      "id": 3,
      "title": "Jadwal Kegiatan Masjid",
      "image": "https://via.placeholder.com/1920x1080?text=Pengumuman+3",
      "duration": 5
    }
  ]
}
EOF
```

- [ ] **Step 3: Create prayer-times.csv**

```bash
cat > public-data/prayer-times.csv << 'EOF'
tanggal,bulan,imsak,subuh,terbit,duha,zuhur,asar,magrib,isya
9,Juni,04:25,04:30,05:45,06:30,12:15,15:30,18:00,19:30
10,Juni,04:24,04:29,05:46,06:31,12:15,15:31,18:01,19:31
11,Juni,04:23,04:28,05:47,06:32,12:15,15:32,18:02,19:32
12,Juni,04:23,04:28,05:48,06:33,12:15,15:33,18:03,19:33
13,Juni,04:22,04:27,05:49,06:34,12:15,15:34,18:04,19:34
14,Juni,04:22,04:27,05:50,06:35,12:15,15:35,18:05,19:35
15,Juni,04:22,04:27,05:50,06:35,12:15,15:35,18:05,19:35
EOF
```

- [ ] **Step 4: Create schedule.json**

```bash
cat > public-data/schedule.json << 'EOF'
{
  "murottal": [
    {
      "day": "thursday",
      "time": "17:00",
      "audioFile": "https://raw.githubusercontent.com/your-username/masjid-tv-display/main/public-data/audio/murottal.mp3"
    },
    {
      "day": "friday",
      "time": "10:30",
      "audioFile": "https://raw.githubusercontent.com/your-username/masjid-tv-display/main/public-data/audio/murottal.mp3"
    }
  ]
}
EOF
```

- [ ] **Step 5: Create .gitkeep files for audio directory**

```bash
mkdir -p public-data/images
mkdir -p public-data/audio
touch public-data/audio/.gitkeep
touch public-data/images/.gitkeep
```

- [ ] **Step 6: Commit sample data**

```bash
git add public-data/
git commit -m "feat: add sample data files (config, announcements, prayer times, schedule)"
```

---

### Task 13: Build and Test TV Display App

**Files:**
- Create: `.github/workflows/build-deploy.yml`

- [ ] **Step 1: Create GitHub Actions workflow**

```bash
mkdir -p .github/workflows

cat > .github/workflows/build-deploy.yml << 'EOF'
name: Build and Deploy TV Display

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: cd src && npm install
      
      - name: Build
        run: cd src && npm run build
      
      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./src/dist
          cname: masjid-tv.example.com
EOF
```

- [ ] **Step 2: Test build locally**

```bash
cd src
npm run build
cd ..
```

Expected output:
```
vite v4.x.x building for production...
✓ 123 modules transformed
dist/index.html            1.5 kB
dist/assets/index-xxx.js   45.3 kB │ gzip: 14.2 kB
dist/assets/index-xxx.css  2.1 kB │ gzip: 0.8 kB
```

- [ ] **Step 3: Verify dist folder structure**

```bash
ls -la src/dist/
```

Expected:
```
index.html
manifest.json
assets/
  index-[hash].js
  index-[hash].css
service-worker.js
```

- [ ] **Step 4: Commit workflow**

```bash
git add .github/
git commit -m "feat: add GitHub Actions CI/CD workflow"
```

---

## Phase 3: Admin Panel (Next.js)

### Task 14: Set Up Next.js Admin Panel

**Files:**
- Create: `admin/package.json`
- Create: `admin/next.config.js`
- Create: `admin/pages/_app.js`
- Create: `admin/.env.local` (template)

- [ ] **Step 1: Create admin/package.json**

```bash
cat > admin/package.json << 'EOF'
{
  "name": "masjid-tv-admin",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "export": "next export"
  },
  "dependencies": {
    "next": "^13.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next-auth": "^4.22.0",
    "@octokit/rest": "^19.0.0"
  },
  "devDependencies": {
    "eslint": "^8.40.0",
    "eslint-config-next": "^13.4.0"
  }
}
EOF
```

- [ ] **Step 2: Create next.config.js**

```bash
cat > admin/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone'
}

module.exports = nextConfig
EOF
```

- [ ] **Step 3: Create admin/pages/_app.js**

```bash
cat > admin/pages/_app.js << 'EOF'
import { SessionProvider } from 'next-auth/react'
import '../styles/globals.css'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
EOF
```

- [ ] **Step 4: Create admin/.env.local template**

```bash
cat > admin/.env.local.example << 'EOF'
# GitHub OAuth
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# GitHub App
GITHUB_ID=your-github-app-id
GITHUB_SECRET=your-github-app-secret

# Repository
GITHUB_REPO_OWNER=your-username
GITHUB_REPO_NAME=masjid-tv-display
GITHUB_BRANCH=main
GITHUB_DATA_PATH=public-data
EOF
```

- [ ] **Step 5: Create admin styles/globals.css**

```bash
mkdir -p admin/styles

cat > admin/styles/globals.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #f5f5f5;
  color: #333;
}

button {
  cursor: pointer;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  transition: all 0.2s;
}

button:hover {
  background: #f0f0f0;
  border-color: #bbb;
}

button:active {
  transform: scale(0.98);
}

input, textarea, select {
  font-family: inherit;
  font-size: 1rem;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #2d5016;
  box-shadow: 0 0 0 3px rgba(45, 80, 22, 0.1);
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
EOF
```

- [ ] **Step 6: npm install and commit**

```bash
cd admin
npm install
cd ..
git add admin/package.json admin/next.config.js admin/pages/ admin/styles/ admin/.env.local.example
git commit -m "feat: setup Next.js admin panel boilerplate"
```

---

### Task 15: Implement GitHub OAuth Authentication

**Files:**
- Create: `admin/pages/api/auth/[...nextauth].js`
- Create: `admin/components/AuthProvider.jsx`
- Create: `admin/utils/githubApi.js`

- [ ] **Step 1: Create [...nextauth].js**

```bash
cat > admin/pages/api/auth/[...nextauth].js << 'EOF'
import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    }
  },
  pages: {
    signIn: '/signin',
    error: '/auth/error'
  }
}

export default NextAuth(authOptions)
EOF
```

- [ ] **Step 2: Create AuthProvider.jsx**

```bash
mkdir -p admin/components

cat > admin/components/AuthProvider.jsx << 'EOF'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

export function ProtectedPage({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div className="container"><p>Loading...</p></div>
  }

  if (status === 'unauthenticated') {
    router.push('/signin')
    return null
  }

  return children
}

export function useAuth() {
  const { data: session, status } = useSession()
  return {
    session,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    signIn,
    signOut
  }
}
EOF
```

- [ ] **Step 3: Create admin/utils/githubApi.js**

```bash
mkdir -p admin/utils

cat > admin/utils/githubApi.js << 'EOF'
import { Octokit } from '@octokit/rest'

export function createOctokit(accessToken) {
  return new Octokit({
    auth: accessToken
  })
}

export async function getRepositoryContent(octokit, path) {
  try {
    const response = await octokit.repos.getContent({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      path: `${process.env.GITHUB_DATA_PATH}/${path}`,
      branch: process.env.GITHUB_BRANCH
    })

    return {
      sha: response.data.sha,
      content: Buffer.from(response.data.content, 'base64').toString('utf-8')
    }
  } catch (error) {
    console.error('GitHub API error:', error)
    throw error
  }
}

export async function updateRepositoryContent(octokit, path, content, message) {
  try {
    const currentFile = await getRepositoryContent(octokit, path)

    const response = await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      path: `${process.env.GITHUB_DATA_PATH}/${path}`,
      message,
      content: Buffer.from(content).toString('base64'),
      sha: currentFile.sha,
      branch: process.env.GITHUB_BRANCH
    })

    return response.data
  } catch (error) {
    console.error('GitHub API error:', error)
    throw error
  }
}

export async function checkIsCollaborator(octokit, username) {
  try {
    await octokit.repos.checkCollaborator({
      owner: process.env.GITHUB_REPO_OWNER,
      repo: process.env.GITHUB_REPO_NAME,
      username
    })
    return true
  } catch {
    return false
  }
}
EOF
```

- [ ] **Step 4: Create sign-in page**

```bash
cat > admin/pages/signin.js << 'EOF'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function SignIn() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/')
    }
  }, [session, router])

  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
      <h1>Masjid TV Admin Panel</h1>
      <p>Sign in with GitHub to manage content</p>
      <button onClick={() => signIn('github', { callbackUrl: '/' })}>
        Sign in with GitHub
      </button>
    </div>
  )
}
EOF
```

- [ ] **Step 5: Commit authentication setup**

```bash
git add admin/pages/api/auth/ admin/components/AuthProvider.jsx admin/utils/githubApi.js admin/pages/signin.js
git commit -m "feat: implement GitHub OAuth authentication"
```

---

### Task 16: Create Admin Dashboard

**Files:**
- Create: `admin/pages/index.js`
- Create: `admin/styles/dashboard.css`

- [ ] **Step 1: Create admin/pages/index.js (Dashboard)**

```bash
cat > admin/pages/index.js << 'EOF'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="container"><p>Loading...</p></div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Masjid TV Admin Panel</h1>
        <div className="user-info">
          <span>Logged in as: {session.user.name}</span>
          <button onClick={() => signOut({ callbackUrl: '/signin' })}>Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <div className="card">
            <h2>⚙️ Configuration</h2>
            <p>Edit mosque name, location, colors, and settings</p>
            <Link href="/config">
              <button>Edit Config</button>
            </Link>
          </div>

          <div className="card">
            <h2>📢 Announcements</h2>
            <p>Manage slideshow announcements and messages</p>
            <Link href="/announcements">
              <button>Manage Announcements</button>
            </Link>
          </div>

          <div className="card">
            <h2>🕐 Prayer Times</h2>
            <p>Update prayer times and schedule data</p>
            <Link href="/prayer-times">
              <button>Update Prayer Times</button>
            </Link>
          </div>

          <div className="card">
            <h2>🎵 Schedule</h2>
            <p>Set murottal playback schedules</p>
            <Link href="/schedule">
              <button>Edit Schedule</button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
EOF
```

- [ ] **Step 2: Create dashboard styles**

```bash
cat > admin/styles/dashboard.css << 'EOF'
.dashboard-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}

.dashboard-header {
  background: linear-gradient(135deg, #2d5016 0%, #1a3009 100%);
  color: white;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dashboard-header h1 {
  margin: 0;
  font-size: 2rem;
}

.user-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-info button {
  background: #ffaa00;
  color: #2d5016;
  border: none;
  font-weight: bold;
}

.dashboard-main {
  flex: 1;
  padding: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card h2 {
  margin-top: 0;
  color: #2d5016;
  font-size: 1.5rem;
}

.card p {
  margin: 1rem 0;
  color: #666;
}

.card button {
  background: #2d5016;
  color: white;
  border: none;
  width: 100%;
  margin-top: 1rem;
}

.card button:hover {
  background: #1a3009;
}
EOF
```

- [ ] **Step 3: Update admin/styles/globals.css to include dashboard**

```bash
cat >> admin/styles/globals.css << 'EOF'

@import './dashboard.css';
EOF
```

- [ ] **Step 4: Commit dashboard**

```bash
git add admin/pages/index.js admin/styles/dashboard.css
git commit -m "feat: create admin dashboard with navigation cards"
```

---

### Task 17: Create Config Editor Page

**Files:**
- Create: `admin/pages/config.js`
- Create: `admin/components/ConfigForm.jsx`
- Create: `admin/pages/api/config.js`

- [ ] **Step 1: Create ConfigForm.jsx**

```bash
cat > admin/components/ConfigForm.jsx << 'EOF'
import { useState } from 'react'

export default function ConfigForm({ initialData, onSubmit, loading = false }) {
  const [formData, setFormData] = useState(initialData || {
    masjidName: '',
    location: '',
    primaryColor: '#2d5016',
    secondaryColor: '#ffffff',
    textColor: '#000000',
    runningTextColor: '#ffffff',
    runningTextSpeed: 'normal'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="masjidName">Mosque Name</label>
        <input
          id="masjidName"
          name="masjidName"
          type="text"
          value={formData.masjidName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          id="location"
          name="location"
          type="text"
          value={formData.location}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="primaryColor">Primary Color</label>
        <input
          id="primaryColor"
          name="primaryColor"
          type="color"
          value={formData.primaryColor}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="secondaryColor">Secondary Color</label>
        <input
          id="secondaryColor"
          name="secondaryColor"
          type="color"
          value={formData.secondaryColor}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="textColor">Text Color</label>
        <input
          id="textColor"
          name="textColor"
          type="color"
          value={formData.textColor}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="runningTextColor">Running Text Color</label>
        <input
          id="runningTextColor"
          name="runningTextColor"
          type="color"
          value={formData.runningTextColor}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="runningTextSpeed">Running Text Speed</label>
        <select
          id="runningTextSpeed"
          name="runningTextSpeed"
          value={formData.runningTextSpeed}
          onChange={handleChange}
        >
          <option value="slow">Slow</option>
          <option value="normal">Normal</option>
          <option value="fast">Fast</option>
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Configuration'}
      </button>
    </form>
  )
}
EOF
```

- [ ] **Step 2: Create API endpoint for config**

```bash
cat > admin/pages/api/config.js << 'EOF'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { createOctokit, getRepositoryContent, updateRepositoryContent } from '../../utils/githubApi'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const octokit = createOctokit(session.accessToken)

  if (req.method === 'GET') {
    try {
      const { content } = await getRepositoryContent(octokit, 'config.json')
      const config = JSON.parse(content)
      res.status(200).json(config)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const content = JSON.stringify(req.body, null, 2)
      const message = `chore: update config [admin: ${session.user.name}]`
      
      await updateRepositoryContent(octokit, 'config.json', content, message)
      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
EOF
```

- [ ] **Step 3: Create config.js page**

```bash
cat > admin/pages/config.js << 'EOF'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import ConfigForm from '../components/ConfigForm'

export default function ConfigPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchConfig()
    }
  }, [session])

  async function fetchConfig() {
    try {
      const response = await fetch('/api/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      setMessage('Failed to load config: ' + error.message)
    }
  }

  async function handleSubmit(formData) {
    setLoading(true)
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setMessage('✅ Config saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('❌ Failed to save config')
      }
    } catch (error) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || !config) {
    return <div className="container"><p>Loading...</p></div>
  }

  return (
    <div className="admin-page">
      <Link href="/">← Back to Dashboard</Link>
      
      <h1>Edit Configuration</h1>
      
      {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}
      
      <ConfigForm
        initialData={config}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  )
}
EOF
```

- [ ] **Step 4: Add admin page styles**

```bash
cat >> admin/styles/globals.css << 'EOF'

.admin-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-page a {
  color: #2d5016;
  text-decoration: none;
  margin-bottom: 1rem;
  display: inline-block;
}

.admin-page a:hover {
  text-decoration: underline;
}

.message {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

.message.success {
  background: #c8e6c9;
  color: #2e7d32;
}

.message.error {
  background: #ffcdd2;
  color: #c62828;
}
EOF
```

- [ ] **Step 5: Commit config editor**

```bash
git add admin/pages/config.js admin/components/ConfigForm.jsx admin/pages/api/config.js
git commit -m "feat: implement config editor with API endpoint"
```

---

### Task 18: Create Announcements Manager Page

**Files:**
- Create: `admin/pages/announcements.js`
- Create: `admin/components/AnnouncementForm.jsx`
- Create: `admin/pages/api/announcements.js`

- [ ] **Step 1: Create AnnouncementForm.jsx**

```bash
cat > admin/components/AnnouncementForm.jsx << 'EOF'
import { useState } from 'react'

export default function AnnouncementForm({ announcement, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState(announcement || {
    id: Date.now(),
    title: '',
    image: '',
    duration: 5
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="Announcement title"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="image">Image URL</label>
        <input
          id="image"
          name="image"
          type="url"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://..."
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="duration">Duration (seconds)</label>
        <input
          id="duration"
          name="duration"
          type="number"
          value={formData.duration}
          onChange={handleChange}
          min="1"
          max="30"
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Announcement'}
        </button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}
EOF
```

- [ ] **Step 2: Create API endpoint for announcements**

```bash
cat > admin/pages/api/announcements.js << 'EOF'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { createOctokit, getRepositoryContent, updateRepositoryContent } from '../../utils/githubApi'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const octokit = createOctokit(session.accessToken)

  if (req.method === 'GET') {
    try {
      const { content } = await getRepositoryContent(octokit, 'announcements.json')
      const data = JSON.parse(content)
      res.status(200).json(data)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const content = JSON.stringify(req.body, null, 2)
      const message = `chore: update announcements [admin: ${session.user.name}]`
      
      await updateRepositoryContent(octokit, 'announcements.json', content, message)
      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
EOF
```

- [ ] **Step 3: Create announcements.js page**

```bash
cat > admin/pages/announcements.js << 'EOF'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AnnouncementForm from '../components/AnnouncementForm'

export default function AnnouncementsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchAnnouncements()
    }
  }, [session])

  async function fetchAnnouncements() {
    try {
      const response = await fetch('/api/announcements')
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.announcements || [])
      }
    } catch (error) {
      setMessage('Failed to load announcements: ' + error.message)
    }
  }

  async function handleSave(formData) {
    setLoading(true)
    try {
      const updated = editingId
        ? announcements.map(a => a.id === editingId ? formData : a)
        : [...announcements, formData]

      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcements: updated })
      })

      if (response.ok) {
        setAnnouncements(updated)
        setEditingId(null)
        setMessage('✅ Announcement saved!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('❌ Failed to save')
      }
    } catch (error) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleDelete(id) {
    if (confirm('Delete this announcement?')) {
      const updated = announcements.filter(a => a.id !== id)
      handleSave(updated)
    }
  }

  if (status === 'loading') {
    return <div className="container"><p>Loading...</p></div>
  }

  return (
    <div className="admin-page">
      <Link href="/">← Back to Dashboard</Link>
      
      <h1>Manage Announcements</h1>
      
      {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

      {editingId ? (
        <>
          <h2>Edit Announcement</h2>
          <AnnouncementForm
            announcement={announcements.find(a => a.id === editingId)}
            onSubmit={handleSave}
            onCancel={() => setEditingId(null)}
            loading={loading}
          />
        </>
      ) : (
        <>
          <h2>Add New Announcement</h2>
          <AnnouncementForm
            onSubmit={handleSave}
            loading={loading}
          />
        </>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>Current Announcements ({announcements.length})</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {announcements.map(ann => (
            <li key={ann.id} style={{ padding: '1rem', background: '#f5f5f5', marginBottom: '0.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{ann.title}</strong>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>{ann.duration}s</p>
              </div>
              <div>
                <button onClick={() => setEditingId(ann.id)}>Edit</button>
                <button onClick={() => handleDelete(ann.id)} style={{ marginLeft: '0.5rem', background: '#ffcccc' }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
EOF
```

- [ ] **Step 4: Commit announcements manager**

```bash
git add admin/pages/announcements.js admin/components/AnnouncementForm.jsx admin/pages/api/announcements.js
git commit -m "feat: implement announcements manager with add/edit/delete"
```

---

### Task 19: Create Prayer Times Editor Page

**Files:**
- Create: `admin/pages/prayer-times.js`
- Create: `admin/pages/api/prayer-times.js`

- [ ] **Step 1: Create API endpoint**

```bash
cat > admin/pages/api/prayer-times.js << 'EOF'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { createOctokit, getRepositoryContent, updateRepositoryContent } from '../../utils/githubApi'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const octokit = createOctokit(session.accessToken)

  if (req.method === 'GET') {
    try {
      const { content } = await getRepositoryContent(octokit, 'prayer-times.csv')
      res.status(200).json({ content })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const message = `chore: update prayer times [admin: ${session.user.name}]`
      
      await updateRepositoryContent(octokit, 'prayer-times.csv', req.body.content, message)
      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
EOF
```

- [ ] **Step 2: Create prayer-times.js page**

```bash
cat > admin/pages/prayer-times.js << 'EOF'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function PrayerTimesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchPrayerTimes()
    }
  }, [session])

  async function fetchPrayerTimes() {
    try {
      const response = await fetch('/api/prayer-times')
      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
      }
    } catch (error) {
      setMessage('Failed to load prayer times: ' + error.message)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/prayer-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (response.ok) {
        setMessage('✅ Prayer times saved!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('❌ Failed to save')
      }
    } catch (error) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || !content) {
    return <div className="container"><p>Loading...</p></div>
  }

  return (
    <div className="admin-page">
      <Link href="/">← Back to Dashboard</Link>
      
      <h1>Edit Prayer Times</h1>
      
      {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="csv">Prayer Times CSV</label>
          <textarea
            id="csv"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ fontFamily: 'monospace', height: '400px' }}
            required
          />
          <small>Format: tanggal,bulan,imsak,subuh,terbit,duha,zuhur,asar,magrib,isya</small>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Prayer Times'}
        </button>
      </form>
    </div>
  )
}
EOF
```

- [ ] **Step 3: Commit prayer times editor**

```bash
git add admin/pages/prayer-times.js admin/pages/api/prayer-times.js
git commit -m "feat: implement prayer times CSV editor"
```

---

### Task 20: Create Schedule Editor Page

**Files:**
- Create: `admin/pages/schedule.js`
- Create: `admin/pages/api/schedule.js`

- [ ] **Step 1: Create API endpoint**

```bash
cat > admin/pages/api/schedule.js << 'EOF'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { createOctokit, getRepositoryContent, updateRepositoryContent } from '../../utils/githubApi'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const octokit = createOctokit(session.accessToken)

  if (req.method === 'GET') {
    try {
      const { content } = await getRepositoryContent(octokit, 'schedule.json')
      const data = JSON.parse(content)
      res.status(200).json(data)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const content = JSON.stringify(req.body, null, 2)
      const message = `chore: update murottal schedule [admin: ${session.user.name}]`
      
      await updateRepositoryContent(octokit, 'schedule.json', content, message)
      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
EOF
```

- [ ] **Step 2: Create schedule.js page**

```bash
cat > admin/pages/schedule.js << 'EOF'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function SchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [murottal, setMurottal] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ day: 'thursday', time: '17:00', audioFile: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchSchedule()
    }
  }, [session])

  async function fetchSchedule() {
    try {
      const response = await fetch('/api/schedule')
      if (response.ok) {
        const data = await response.json()
        setMurottal(data.murottal || [])
      }
    } catch (error) {
      setMessage('Failed to load schedule: ' + error.message)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const updated = editingId
        ? murottal.map(m => m.id === editingId ? { ...formData, id: editingId } : m)
        : [...murottal, { ...formData, id: Date.now() }]

      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ murottal: updated })
      })

      if (response.ok) {
        setMurottal(updated)
        setFormData({ day: 'thursday', time: '17:00', audioFile: '' })
        setEditingId(null)
        setMessage('✅ Schedule saved!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('❌ Failed to save')
      }
    } catch (error) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleDelete(id) {
    if (confirm('Delete this schedule?')) {
      const updated = murottal.filter(m => m.id !== id)
      setMurottal(updated)
      fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ murottal: updated })
      })
    }
  }

  if (status === 'loading') {
    return <div className="container"><p>Loading...</p></div>
  }

  return (
    <div className="admin-page">
      <Link href="/">← Back to Dashboard</Link>
      
      <h1>Edit Murottal Schedule</h1>
      
      {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="day">Day</label>
          <select
            id="day"
            value={formData.day}
            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
          >
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="time">Time (HH:MM)</label>
          <input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="audioFile">Audio File URL</label>
          <input
            id="audioFile"
            type="url"
            value={formData.audioFile}
            onChange={(e) => setFormData({ ...formData, audioFile: e.target.value })}
            placeholder="https://..."
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {editingId ? (loading ? 'Updating...' : 'Update Schedule') : (loading ? 'Adding...' : 'Add Schedule')}
        </button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ day: 'thursday', time: '17:00', audioFile: '' }); }}>Cancel</button>}
      </form>

      <div style={{ marginTop: '2rem' }}>
        <h2>Current Schedule ({murottal.length})</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {murottal.map(m => (
            <li key={m.id} style={{ padding: '1rem', background: '#f5f5f5', marginBottom: '0.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{m.day.toUpperCase()}</strong>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>{m.time}</p>
              </div>
              <div>
                <button onClick={() => { setEditingId(m.id); setFormData(m); }}>Edit</button>
                <button onClick={() => handleDelete(m.id)} style={{ marginLeft: '0.5rem', background: '#ffcccc' }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
EOF
```

- [ ] **Step 3: Commit schedule editor**

```bash
git add admin/pages/schedule.js admin/pages/api/schedule.js
git commit -m "feat: implement murottal schedule editor"
```

---

### Task 21: Final Integration & Documentation

**Files:**
- Create: `README.md`
- Create: `.gitignore`
- Modify: `package.json` (root scripts)

- [ ] **Step 1: Create README.md**

```bash
cat > README.md << 'EOF'
# Masjid TV Display

A full-stack web application for displaying mosque information on Smart TV screens with real-time admin management via GitHub.

## Features

- **TV Display App:** Real-time display of prayer times, announcements, Hijri calendar, and running text
- **Audio System:** Automatic Tarhim playback 6 minutes before prayer times, Murottal on schedule
- **Admin Panel:** GitHub OAuth authentication, manage configuration, announcements, prayer times, and schedules
- **Offline Support:** Service Worker caching for continuous display even without internet
- **GitHub-Native:** All data stored in GitHub repository, no external database needed

## Project Structure

- `src/` - React TV Display app (Vite)
- `admin/` - Next.js Admin Panel
- `public-data/` - Data files (JSON, CSV) and audio
- `docs/superpowers/` - Design specs and implementation plans

## Setup

### 1. GitHub OAuth App Setup

Create a GitHub OAuth application:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Note the Client ID and Client Secret

### 2. Environment Variables

Create `admin/.env.local`:
```
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
GITHUB_ID=<your-github-app-id>
GITHUB_SECRET=<your-github-app-secret>
GITHUB_REPO_OWNER=<your-username>
GITHUB_REPO_NAME=masjid-tv-display
GITHUB_BRANCH=main
GITHUB_DATA_PATH=public-data
```

### 3. Install Dependencies

```bash
cd src && npm install
cd ../admin && npm install
cd ..
```

### 4. Run Development Servers

Terminal 1 (TV Display):
```bash
cd src
npm run dev
# Open http://localhost:5173
```

Terminal 2 (Admin Panel):
```bash
cd admin
npm run dev
# Open http://localhost:3000
```

## Deployment

### TV Display to GitHub Pages

```bash
cd src
npm run build
cd ..
```

Push `src/dist` to GitHub Pages or use GitHub Actions workflow.

### Admin Panel to Vercel

```bash
vercel --prod
```

## Usage

1. **Admin Panel:** Visit `http://localhost:3000`
2. **Sign in** with GitHub
3. **Edit Configuration:** Mosque name, location, colors
4. **Manage Announcements:** Add/edit slideshow content
5. **Update Prayer Times:** Upload CSV with prayer schedule
6. **Set Schedules:** Configure Murottal playback times
7. **Publish:** Changes commit to GitHub automatically

TV Display will pull latest data on manual refresh (F5).

## Data Files

All data stored in `public-data/` directory:
- `config.json` - Mosque configuration
- `announcements.json` - Slideshow content
- `prayer-times.csv` - Daily prayer times
- `schedule.json` - Murottal schedules
- `audio/` - Audio files (tarhim.mp3, murottal.mp3)
- `images/` - Announcement images

## Technology Stack

**TV Display:**
- React 18
- Vite
- Service Worker + Local Storage (offline)
- hijri-date
- HTML5 Audio API

**Admin Panel:**
- Next.js 13
- NextAuth.js (GitHub OAuth)
- Octokit (GitHub API)

**Shared:**
- GitHub (data storage & source)
- GitHub Pages (TV display hosting)
- Vercel (admin panel hosting, optional)

## Contributing

1. Clone the repo
2. Create a feature branch
3. Make changes and test locally
4. Commit and push
5. Create a Pull Request

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
EOF
```

- [ ] **Step 2: Create .gitignore**

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment
.env.local
.env.*.local

# Build outputs
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*

# Runtime
.vercel
EOF
```

- [ ] **Step 3: Update root package.json scripts**

```bash
cat > package.json << 'EOF'
{
  "name": "masjid-tv-display",
  "version": "1.0.0",
  "description": "Mosque TV Display with Admin Panel",
  "private": true,
  "scripts": {
    "dev": "concurrently \"cd src && npm run dev\" \"cd admin && npm run dev\"",
    "build": "npm run build:tv && npm run build:admin",
    "build:tv": "cd src && npm run build",
    "build:admin": "cd admin && npm run build",
    "start:admin": "cd admin && npm start"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
EOF

npm install --save-dev concurrently
```

- [ ] **Step 4: Final commit**

```bash
git add README.md .gitignore package.json
git commit -m "chore: add documentation and finalize setup"
```

---

## Summary

This plan implements a complete Masjid TV Display system with 21 coordinated tasks:

**TV Display (Tasks 2-13):** Vite + React app with components for header, slideshow, prayer times, running text. Includes Service Worker for offline support, custom hooks for data fetching and audio playback.

**Admin Panel (Tasks 14-20):** Next.js app with GitHub OAuth auth, dashboard, and editors for config, announcements, prayer times, and murottal schedules. All changes commit to GitHub automatically.

**Infrastructure (Tasks 1, 21):** Monorepo setup, GitHub Actions CI/CD, documentation.

Each task is bite-sized (2-5 min), with exact file paths, code blocks, and commands. Execute via subagent-driven-development for best results.

---

**Ready for Implementation:** Use superpowers:subagent-driven-development or superpowers:executing-plans to execute tasks in sequence.
