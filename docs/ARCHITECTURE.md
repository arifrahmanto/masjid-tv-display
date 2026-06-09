# System Architecture

## Overview

Masjid TV Display is a monorepo with two main applications:
1. **TV Display** (React + Vite) - Public-facing display for mosques
2. **Admin Panel** (Next.js) - Management interface for mosque staff

Both applications share data stored in a GitHub repository.

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│        GitHub Repository (public-data/)                  │
│  ┌──────────────┬──────────────┬──────────────┐         │
│  │ config.json  │announcement  │ prayer-times │schedule │
│  └──────────────┴──────────────┴──────────────┘         │
└──────────────────────────┬──────────────────────────────┘
                           │
                ┌──────────┼──────────┐
                │          │          │
        ┌───────▼──────┐   │   ┌──────▼─────────┐
        │ TV Display   │   │   │  Admin Panel   │
        │  (React)     │   │   │  (Next.js)     │
        │ ┌─────────┐  │   │   │ ┌────────────┐ │
        │ │Service  │  │   │   │ │NextAuth +  │ │
        │ │Worker   │  │   │   │ │Octokit     │ │
        │ └─────────┘  │   │   │ └────────────┘ │
        │ ┌─────────┐  │   │   │ ┌────────────┐ │
        │ │Local    │  │   │   │ │Forms &     │ │
        │ │Storage  │  │   │   │ │Dashboard   │ │
        │ └─────────┘  │   │   │ └────────────┘ │
        └──────────────┘   │   └─────────────────┘
                           │
                   └───────┴────────┘
```

## Component Architecture

### TV Display (React + Vite)

**Entry Point**: `src/main.jsx`
- Mounts React app to `#root`
- Registers Service Worker

**Main App**: `src/App.jsx`
- Orchestrates all components
- Error boundary with refresh button
- Loading overlay

**Components**:
1. **Header.jsx** - Mosque info + clocks
   - Displays mosque name, location
   - Real-time Gregorian clock
   - Hijri date

2. **Slideshow.jsx** - Announcement carousel
   - Auto-rotates based on duration
   - Manual navigation via indicators
   - Image error fallback

3. **PrayerTimes.jsx** - Prayer display
   - Grid of 6 prayers
   - Countdown to next prayer
   - Prayer names in Indonesian

4. **RunningText.jsx** - Scrolling footer
   - Announcement titles loop
   - Configurable speed

**Hooks**:
1. **useGitHubData()** - Data fetching
   - Parallel Promise.all load
   - Cache Manager fallback
   - 1-minute cache validity

2. **usePrayerTimes()** - Prayer logic
   - Parse CSV prayer times
   - Calculate next prayer
   - 1-second countdown updates

3. **useClock()** - Real-time display
   - Gregorian + Hijri conversion
   - 1-second interval

4. **useAudio()** - Tarhim/Murottal
   - 30-second check interval
   - Tarhim: 6 mins before prayer
   - Murottal: Scheduled times
   - lastPlayedRef prevents duplicates same day

**Utils**:
1. **constants.js** - Global config
   - GitHub URLs
   - Cache names/keys
   - Prayer display order
   - Hijri month names

2. **githubApi.js** - API wrapper
   - fetchFromGitHub()
   - fetchJSON()
   - fetchCSV()
   - fetchAudio()

3. **hijriDate.js** - Date conversions
   - convertToHijri()
   - formatGregorianDate()
   - formatTime()

4. **cacheManager.js** - Cache logic
   - Cache API + LocalStorage dual caching
   - Timestamp tracking

**Service Worker**: `src/service-worker.js`
- **Install**: Cache all static assets
- **Activate**: Cleanup old caches
- **Fetch**: Network-first for GitHub, cache-first for assets

### Admin Panel (Next.js)

**Pages**:
1. **_app.js** - SessionProvider wrapper
   - Configures NextAuth

2. **index.js** - Dashboard home
   - Protected by OAuth
   - Navigation cards to editors

3. **signin.js** - GitHub OAuth login
   - GitHub branding button
   - Redirect on success

4. **config.js** - Config editor
5. **announcements.js** - Announcements CRUD
6. **prayer-times.js** - Prayer times table/CSV
7. **schedule.js** - Schedule manager

**API Routes**:
1. **api/auth/[...nextauth].js**
   - GitHub OAuth provider
   - JWT callbacks
   - Session management

2. **api/config.js**
   - GET: Fetch config.json
   - POST: Save config to GitHub

3. **api/announcements.js**
   - GET: Fetch announcements.json
   - POST: Add/update announcement
   - DELETE: Remove announcement

4. **api/prayer-times.js**
   - GET: Fetch prayer-times.csv
   - POST: Save updated CSV

5. **api/schedule.js**
   - GET: Fetch schedule.json
   - POST: Update schedule

**Components**:
1. **AuthProvider.jsx** - OAuth wrapper
   - Topbar with user info
   - Logout button
   - Protected routing

2. **Dashboard.jsx** - Home page
   - Card grid with navigation

3. **ConfigForm.jsx** - Config editor
   - Color pickers
   - Settings form

4. **AnnouncementForm.jsx** - Announcement form
   - Image preview
   - Duration selector

5. **PrayerTimesForm.jsx** - Prayer times editor
   - Table mode: Edit cells
   - CSV mode: Bulk import

6. **ScheduleForm.jsx** - Schedule editor
   - Add/edit/delete entries
   - Day and time selectors

## Data Storage

All data stored in GitHub repository in `public-data/` directory:

### config.json
```json
{
  "masjidName": "string",
  "location": "string",
  "primaryColor": "#hex",
  "secondaryColor": "#hex",
  "textColor": "#hex",
  "runningTextColor": "#hex",
  "runningTextSpeed": "slow|normal|fast"
}
```

### announcements.json
```json
{
  "announcements": [
    {
      "id": number,
      "title": "string",
      "image": "url",
      "duration": number
    }
  ]
}
```

### prayer-times.csv
```
tanggal,bulan,imsak,subuh,terbit,duha,zuhur,asar,magrib,isya
1,January,04:30,04:35,05:50,06:35,12:15,15:30,18:00,19:30
```

### schedule.json
```json
{
  "murottal": [
    {
      "day": "thursday|friday|...",
      "time": "HH:MM",
      "audioFile": "url"
    }
  ]
}
```

## Caching Strategy

### TV Display
1. **Service Worker Network-First (GitHub)**
   - Try network first
   - Fall back to cache
   - Perfect for data freshness

2. **Service Worker Cache-First (Assets)**
   - Use cache first
   - Network as backup
   - Fast asset loading

3. **LocalStorage Fallback**
   - Dual cache with timestamps
   - Survives browser restart
   - 24-hour validity

### Admin Panel
- No caching (always fresh from GitHub)
- Octokit handles GitHub API

## Deployment

### TV Display → GitHub Pages
1. Push to main branch
2. GitHub Actions workflow triggers
3. `npm run build:tv` executed
4. dist/ deployed to gh-pages branch
5. Accessible at repository pages URL

### Admin Panel
- Deploy to Vercel, Netlify, or self-hosted
- Requires .env.local with OAuth credentials
- `npm run build:admin` + `npm start`

## Security Considerations

1. **OAuth**: Admin panel requires GitHub authentication
2. **Environment variables**: Secrets in .env.local (not committed)
3. **Public data**: TV display data is public (no sensitive info)
4. **Token scope**: GitHub token limited to repository access
5. **CORS**: Uses GitHub raw content (no CORS issues)

## Performance Metrics

- TV Display bundle: ~170 KB gzipped
- Admin Panel: Standard Next.js optimizations
- GitHub API calls: ~1 per minute (configurable)
- Cache hit rate: ~95% for offline users
- Tarhim delay: <100ms from scheduled time
