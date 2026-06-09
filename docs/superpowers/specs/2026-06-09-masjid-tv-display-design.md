# Masjid TV Display Application - Design Specification

**Date:** 2026-06-09  
**Project:** Masjid TV Display with Real-time Admin Management  
**Status:** Design Approved

---

## 1. Overview

A web-based application system for displaying mosque (masjid) information on Smart TV screens via browser/webview. The system comprises:
1. **Admin Panel** - Interface for managing content and configuration
2. **TV Display** - Full-screen application shown on mosque TV
3. **GitHub Repository** - Central data source with configuration, announcements, and prayer schedules

The system prioritizes simplicity, offline resilience, and GitHub-native workflow.

---

## 2. System Architecture

### 2.1 Architecture Pattern: GitHub + Polling + Service Worker

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Repository                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ config.json  │  │ schedule.json│  │ prayer-times.csv     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │announce...json┤  │ audio/       │  │ (data source)        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         ↑                    ↑
         │ (commits)          │ (fetches)
         │                    │
    ┌────────────┐      ┌─────────────────┐
    │ Admin Panel│      │ TV Display App  │
    │ (Next.js)  │      │ (React + SWA)   │
    │            │      │                 │
    │ • OAuth    │      │ • Poll GitHub   │
    │ • Forms    │      │ • Service Worker│
    │ • Publish  │      │ • Local Storage │
    └────────────┘      │ • Offline Cache │
                        └─────────────────┘
```

### 2.2 Data Flow

**Publishing Flow:**
1. Admin edits content in Admin Panel
2. Admin clicks "Publish to TV"
3. Panel commits changes to GitHub repo
4. Commit success → refresh message displayed

**Display Update Flow:**
1. TV app periodically fetches latest data from GitHub raw content
2. Caches data in Local Storage + Service Worker
3. On manual refresh: user refreshes browser → immediate fetch attempt
4. If offline: continues displaying cached data
5. Real-time clock and countdowns update locally without network

---

## 3. Components & Data Structure

### 3.1 Data Files (GitHub Repository)

**`config.json` - Mosque Configuration**
```json
{
  "masjidName": "Masjid Al-Ikhlas",
  "location": "Jakarta",
  "primaryColor": "#2d5016",
  "secondaryColor": "#ffffff",
  "textColor": "#000000",
  "runningTextSpeed": "normal"
}
```

**`announcements.json` - Slideshow Content**
```json
{
  "announcements": [
    {
      "id": 1,
      "title": "Pengumuman Penting",
      "image": "https://github.com/repo/raw/main/images/announce-1.jpg",
      "duration": 5
    },
    {
      "id": 2,
      "title": "Acara Khusus",
      "image": "https://github.com/repo/raw/main/images/announce-2.jpg",
      "duration": 5
    }
  ]
}
```

**`prayer-times.csv` - Prayer Schedule**
```csv
tanggal,bulan,imsak,subuh,terbit,duha,zuhur,asar,magrib,isya
9,Juni,04:25,04:30,05:45,06:30,12:15,15:30,18:00,19:30
10,Juni,04:24,04:29,05:46,06:31,12:15,15:31,18:01,19:31
```
- Format: `HH:MM` (24-hour)
- Columns: tanggal (date), bulan (month), imsak, subuh (fajr), terbit (sunrise), duha, zuhur (dhuhr), asar, magrib, isya (isha)
- One row per day

**`schedule.json` - Murottal Schedule**
```json
{
  "murottal": [
    {
      "day": "thursday",
      "time": "17:00",
      "audioFile": "https://github.com/repo/raw/main/audio/murottal.mp3"
    },
    {
      "day": "friday",
      "time": "10:30",
      "audioFile": "https://github.com/repo/raw/main/audio/murottal.mp3"
    }
  ]
}
```

**Audio Files (in `audio/` folder)**
- `tarhim.mp3` - Preparation audio for Azan (plays 6 mins before prayer time)
- `murottal.mp3` - Quranic recitation for scheduled times

### 3.2 TV Display Layout

Responsive full-screen layout with fixed proportions:

```
┌─────────────────────────────────────────────┐
│ Header (15%)                                │
│ • Mosque Name | Gregorian Date | Hijri Date│
├─────────────────────────────────────────────┤
│                                             │
│         Slideshow (55%)                     │
│    (Announcements with images)              │
│                                             │
├─────────────────────────────────────────────┤
│ Prayer Times (20%)                          │
│ Fajr: 04:30 | Dhuhr: 12:15 | Asr: 15:30   │
│ Maghrib: 18:00 | Isha: 19:30                │
│ Next prayer in: 2h 15m                      │
├─────────────────────────────────────────────┤
│ Running Text Footer (10%)                   │
│ ➤ Masjid Info, Announcements scrolling... │
└─────────────────────────────────────────────┘
```

**Layout Behavior:**
- Responsive to TV screen size (16:9 aspect ratio)
- Font sizes scale proportionally
- All elements visible simultaneously

---

## 4. Feature Specifications

### 4.1 Admin Panel (Next.js App)

**Authentication:**
- GitHub OAuth login (Octokit/GitHub API)
- Only collaborators of the repo can access
- Session-based or token-based auth

**Interface:**
- Dashboard showing current TV display state
- Edit form for:
  - Mosque configuration (name, location, colors)
  - Announcements (add/edit/delete with image upload)
  - Prayer times (import/edit CSV)
  - Murottal schedule (add/edit times)
- Publish button → commits changes to GitHub
- Visual feedback on publish success/failure

**Data Handling:**
- Commit to repo branch (e.g., `main`)
- Include commit message with timestamp
- File updates trigger refresh on TV side

### 4.2 TV Display App (React + GitHub Pages)

**Key Features:**

**Data Loading & Caching:**
- Service Worker registration for offline support
- Fetch data from GitHub raw content API on app load
- Cache all JSON files and audio files locally via Service Worker
- Local Storage backup for data persistence
- Manual refresh button visible to user

**Display Elements:**

1. **Header (15%)**
   - Mosque name and location
   - Real-time clock (Gregorian date & time)
   - Hijri date conversion
   - Auto-update every second

2. **Slideshow (55%)**
   - Carousel through announcements
   - Auto-rotate every 5 seconds (configurable per announcement)
   - Smooth fade/slide transitions
   - Display: image + title overlay
   - Pause on user interaction (if applicable)

3. **Prayer Times (20%)**
   - All 5 prayer times for today
   - Display current/next prayer with countdown timer
   - Update automatically as time passes
   - Visual indicator for current prayer time

4. **Running Text Footer (10%)**
   - Continuous scrolling text with mosque info
   - Cycle through announcements and general info
   - Configurable scroll speed
   - Color: configurable from config.json

**Audio Features:**

- **Tarhim (Azan Preparation):**
  - 6 minutes before each prayer time, play `tarhim.mp3`
  - Check prayer times against current system time
  - Audio can be muted via UI control (optional)

- **Murottal Playback:**
  - Schedule-based playback (Thursday 17:00, Friday 10:30)
  - Triggered automatically at scheduled times
  - Cross-browser audio API support

**Offline Resilience:**
- Service Worker caches all resources on first load
- If GitHub fetch fails, use cached data
- App continues to function with cached data indefinitely
- Countdown timers and clocks work offline
- Audio plays from cache if previously downloaded
- Manual refresh attempts to fetch new data, falls back to cache on failure

**Refresh Mechanism:**
- Manual refresh button in UI (F5 or UI button)
- Optional: Admin can trigger remote refresh (if webhook available)
- Refresh attempts GitHub API fetch
- Success: Update display with new data
- Failure: Display continues with cached data + error message

---

## 5. Technology Stack

### Admin Panel
- **Framework:** Next.js (React)
- **Auth:** GitHub OAuth (via Octokit or similar)
- **Hosting:** GitHub Pages / Vercel
- **Image Upload:** GitHub API or third-party (Cloudinary)

### TV Display
- **Framework:** React
- **Hosting:** GitHub Pages (static)
- **State Management:** React Context or Zustand
- **Data Fetching:** Fetch API + GitHub raw content
- **Offline:** Service Worker + Local Storage
- **Audio:** HTML5 Audio API
- **Date Conversion:** Day.js + Hijri library (hijri-date or similar)
- **Styling:** Tailwind CSS or Styled Components

### Shared
- **Repository:** GitHub (public or private)
- **Version Control:** Git
- **CI/CD:** GitHub Actions (optional, for validation)

---

## 6. Data Flow Details

### 6.1 First Load (TV Display)
```
1. User opens TV display URL
2. Service Worker registers
3. App fetches from GitHub raw:
   - config.json
   - announcements.json
   - prayer-times.csv
   - schedule.json
4. Cache all responses in Service Worker + Local Storage
5. Render layout with data
6. Start timers for clock and countdowns
```

### 6.2 Periodic Updates
```
1. (Optional) Every 30-60 seconds, attempt to fetch latest data
2. If successful, update Local Storage and in-memory state
3. If failed (offline), continue with cached data
4. Re-render with new data (if changed)
```

### 6.3 Manual Refresh
```
1. User clicks "Refresh" button (or F5)
2. Attempt immediate fetch from GitHub
3. If successful: update all components
4. If failed: show notification, continue with cached data
5. Audio files already cached, no re-fetch needed
```

### 6.4 Audio Playback
```
Tarhim (6 mins before prayer):
1. Every minute, check current time against prayer times
2. If current time = prayer time - 6 mins
3. Fetch tarhim.mp3 (or use cached version)
4. Play audio

Murottal (scheduled times):
1. Every minute, check current time against schedule
2. If matches (e.g., Thu 17:00), fetch murottal.mp3 from schedule
3. Play audio
4. Stop after completion
```

---

## 7. File Structure

```
masjid-tv-display/
├── public/
│   └── (static assets)
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Slideshow.jsx
│   │   ├── PrayerTimes.jsx
│   │   ├── RunningText.jsx
│   │   └── AudioController.jsx
│   ├── hooks/
│   │   ├── useGitHubData.js
│   │   ├── usePrayerTimes.js
│   │   └── useAudio.js
│   ├── utils/
│   │   ├── githubApi.js
│   │   ├── hijriDate.js
│   │   ├── cacheManager.js
│   │   └── constants.js
│   ├── App.jsx
│   └── index.css
├── admin/
│   ├── pages/
│   │   ├── index.js (dashboard)
│   │   ├── config.js (edit config)
│   │   ├── announcements.js (manage announcements)
│   │   └── schedule.js (manage schedule)
│   ├── api/
│   │   ├── auth.js
│   │   ├── config.js
│   │   └── publish.js
│   └── components/
│       ├── AuthProvider.jsx
│       └── (admin-specific components)
├── public/ (GitHub Pages source)
│   ├── config.json
│   ├── announcements.json
│   ├── prayer-times.csv
│   ├── schedule.json
│   └── audio/
│       ├── tarhim.mp3
│       └── murottal.mp3
├── docs/
│   └── superpowers/
│       └── specs/
│           └── (this file)
└── package.json
```

---

## 8. Success Criteria

✅ **Core Functionality:**
- [ ] Header displays mosque name, Gregorian date, and Hijri date correctly
- [ ] Slideshow rotates through announcements with proper timing
- [ ] Prayer times display and countdown timer updates in real-time
- [ ] Running text footer scrolls announcements and info
- [ ] Tarhim audio plays 6 minutes before each prayer time
- [ ] Murottal audio plays on Thursday 17:00 and Friday 10:30

✅ **Real-time Updates:**
- [ ] Admin publishes changes → TV updates on manual refresh
- [ ] Offline mode works: TV continues displaying cached data
- [ ] Service Worker caches all resources on first load
- [ ] No refresh needed for clock/countdown updates (local timers)

✅ **User Experience:**
- [ ] Full-screen display is responsive and readable on 16:9 TV
- [ ] Manual refresh button clearly visible and functional
- [ ] Error messages shown gracefully (failed fetches, missing data)
- [ ] Audio can be controlled (volume, mute) if needed

✅ **Admin Panel:**
- [ ] GitHub OAuth login works for collaborators
- [ ] Forms for editing config, announcements, schedule
- [ ] Publish button commits to repo successfully
- [ ] Visual feedback on publish success/failure

---

## 9. Deployment & Hosting

**TV Display:**
- Deploy as static React app to GitHub Pages
- Base URL: `https://username.github.io/masjid-tv-display/`
- Update via commit to `main` branch → auto-deploy

**Admin Panel:**
- Deploy to Vercel or GitHub Pages (if Next.js static export)
- Or self-host on simple Node.js server
- Base URL: `https://admin.example.com/` or similar

**Data Repository:**
- Same repo or separate repo with public raw access
- Data fetched via GitHub raw content API: `https://raw.githubusercontent.com/...`

---

## 10. Future Enhancements (Out of Scope)

- [ ] Multiple TV support (broadcast to different mosques)
- [ ] Admin-triggered remote refresh via webhook
- [ ] Analytics dashboard (TV view count, watch time)
- [ ] Live streaming integration
- [ ] QR code for feedback/information
- [ ] Attendance tracking
- [ ] Video announcements (instead of static images)
- [ ] Dark/light mode toggle
- [ ] Multi-language support

---

## 11. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| GitHub API rate limits | Cache aggressively; implement exponential backoff |
| Offline data staleness | Timestamp cached data; show "Last updated" timestamp |
| Audio not playing | Fallback to text notification; test cross-browser audio |
| Large image files | Compress images; use GitHub CDN with caching headers |
| Concurrent admin edits | Use Git conflict resolution; document workflow |
| TV display issues | Provide clear error messages; manual refresh always available |

---

## 12. Notes

- Design prioritizes **simplicity over features** (YAGNI principle)
- GitHub serves as both CMS and data storage (minimal infrastructure)
- Offline-first approach ensures TV keeps running even if GitHub is down
- Service Worker + Local Storage provides robust caching
- Manual refresh workflow avoids complexity of real-time sync/webhooks
- Audio playback uses browser's HTML5 Audio API (widely supported)

---

**Approved by:** User  
**Ready for:** Implementation Planning
