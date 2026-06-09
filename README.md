# Masjid TV Display System

A complete web-based mosque information display system built with React (TV Display) and Next.js (Admin Panel). Features prayer times, announcements, Islamic calendar, real-time clocks, and audio playback (Tarhim 6 mins before prayer, Murottal on schedule).

## 🌟 Features

### TV Display (React + Vite)
- **Real-time Clocks**: Gregorian + Hijri date/time display
- **Prayer Times**: Display 6 daily prayers with countdown to next prayer
- **Announcements**: Auto-rotating slideshow with configurable duration
- **Running Text**: Scrolling announcements footer
- **Audio Playback**:
  - Tarhim: Plays 6 minutes before each prayer time
  - Murottal: Scheduled playback (e.g., Thursday 17:00, Friday 10:30)
- **Offline Support**: Service Worker caching for offline viewing
- **Responsive Design**: Optimized for 16:9 TV displays

### Admin Panel (Next.js)
- **GitHub OAuth Authentication**: Secure login via GitHub
- **Dashboard**: Central hub for all management tasks
- **Config Editor**: Manage mosque name, location, colors, and settings
- **Announcements Manager**: Create, edit, and delete slideshow announcements
- **Prayer Times Editor**: Edit prayer times with table or CSV modes
- **Audio Schedule**: Configure murottal and tarhim playback schedules
- **GitHub Integration**: All data automatically synced to repository

## 📂 Project Structure

```
.
├── src/                          # TV Display (React + Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── main.jsx                  # Entry point
│   ├── App.jsx                   # Main component
│   ├── index.css                 # Global styles
│   ├── service-worker.js         # Offline caching
│   ├── components/
│   │   ├── Header.jsx            # Mosque name + clock
│   │   ├── Slideshow.jsx         # Announcement carousel
│   │   ├── PrayerTimes.jsx       # Prayer times display
│   │   └── RunningText.jsx       # Scrolling footer
│   ├── hooks/
│   │   ├── useGitHubData.js      # Fetch all data from GitHub
│   │   ├── usePrayerTimes.js     # Parse prayer times + countdown
│   │   ├── useClock.js           # Real-time clock
│   │   ├── useAudio.js           # Tarhim/Murottal playback
│   │   └── index.js
│   ├── utils/
│   │   ├── constants.js          # Global constants
│   │   ├── githubApi.js          # GitHub API wrapper
│   │   ├── hijriDate.js          # Hijri conversion
│   │   └── cacheManager.js       # Cache + LocalStorage
│   ├── public/
│   │   └── manifest.json         # PWA manifest
│   └── dist/                     # Build output (generated)
│
├── admin/                        # Admin Panel (Next.js)
│   ├── package.json
│   ├── next.config.js
│   ├── .env.local.example
│   ├── pages/
│   │   ├── _app.js               # SessionProvider wrapper
│   │   ├── index.js              # Dashboard
│   │   ├── signin.js             # GitHub OAuth sign-in
│   │   ├── config.js             # Config editor
│   │   ├── announcements.js      # Announcements manager
│   │   ├── prayer-times.js       # Prayer times editor
│   │   ├── schedule.js           # Schedule editor
│   │   └── api/
│   │       ├── auth/[...nextauth].js   # NextAuth config
│   │       ├── config.js         # Config API
│   │       ├── announcements.js  # Announcements API
│   │       ├── prayer-times.js   # Prayer times API
│   │       └── schedule.js       # Schedule API
│   ├── components/
│   │   ├── AuthProvider.jsx      # OAuth wrapper + topbar
│   │   ├── Dashboard.jsx         # Dashboard cards
│   │   ├── ConfigForm.jsx        # Config form
│   │   ├── AnnouncementForm.jsx  # Announcement form
│   │   ├── PrayerTimesForm.jsx   # Prayer times form
│   │   └── ScheduleForm.jsx      # Schedule form
│   ├── styles/
│   │   ├── globals.css
│   │   ├── signin.module.css
│   │   ├── dashboard.module.css
│   │   ├── config.module.css
│   │   ├── announcements.module.css
│   │   ├── prayer-times.module.css
│   │   └── schedule.module.css
│   └── .env.local                # Environment (create from .env.local.example)
│
├── public-data/                  # Data storage (GitHub committed)
│   ├── config.json               # Mosque settings
│   ├── announcements.json        # Slideshow announcements
│   ├── prayer-times.csv          # Daily prayer times (9 columns)
│   ├── schedule.json             # Murottal/Tarhim schedules
│   ├── audio/                    # Audio files (.gitkeep)
│   └── images/                   # Announcement images (.gitkeep)
│
├── .github/
│   └── workflows/
│       └── build-deploy.yml      # Auto-deploy TV display to GitHub Pages
│
├── docs/
│   ├── superpowers/
│   │   ├── specs/
│   │   │   └── 2026-06-09-masjid-tv-display-design.md
│   │   └── plans/
│   │       └── 2026-06-09-masjid-tv-display-plan.md
│   └── ARCHITECTURE.md           # (optional) Technical deep-dive
│
├── package.json                  # Root monorepo scripts
├── README.md                     # This file
└── .gitignore
```

## 🚀 Setup & Deployment

### Prerequisites
- Node.js 18+
- GitHub account with OAuth app credentials
- Git repository (public or private)

### TV Display Setup

1. **Install dependencies**:
   ```bash
   cd src
   npm install
   cd ..
   ```

2. **Local development**:
   ```bash
   npm run dev:tv
   # Opens http://localhost:5173
   ```

3. **Build for production**:
   ```bash
   npm run build:tv
   ```

4. **Deploy to GitHub Pages**:
   - Push to main branch → GitHub Actions automatically builds & deploys
   - TV display available at: `https://github.com/{username}/{repo}/settings/pages`
   - (After workflow completes, or use custom domain if configured)

### Admin Panel Setup

1. **Create GitHub OAuth App**:
   - Go to GitHub Settings → Developer Settings → OAuth Apps
   - Create new OAuth App:
     - Application name: "Masjid TV Admin"
     - Homepage URL: `http://localhost:3000` (local) or `https://admin.example.com` (production)
     - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - Copy Client ID and Client Secret

2. **Install dependencies**:
   ```bash
   cd admin
   npm install
   cd ..
   ```

3. **Configure environment**:
   ```bash
   cp admin/.env.local.example admin/.env.local
   ```
   Edit `admin/.env.local`:
   ```env
   NEXTAUTH_SECRET=your-secret-here-generate-with-openssl-rand-base64-32
   NEXTAUTH_URL=http://localhost:3000

   GITHUB_ID=your-oauth-app-id
   GITHUB_SECRET=your-oauth-app-secret

   GITHUB_REPO_OWNER=your-github-username
   GITHUB_REPO_NAME=masjid-tv-display
   GITHUB_BRANCH=main
   GITHUB_DATA_PATH=public-data
   ```

4. **Local development**:
   ```bash
   npm run dev:admin
   # Opens http://localhost:3000
   ```

5. **Build for production**:
   ```bash
   npm run build:admin
   npm run start:admin
   ```

### Data Configuration

**config.json** - Mosque settings:
```json
{
  "masjidName": "Masjid Al-Ikhlas",
  "location": "Jakarta, Indonesia",
  "primaryColor": "#2d5016",
  "secondaryColor": "#ffffff",
  "textColor": "#000000",
  "runningTextColor": "#ffffff",
  "runningTextSpeed": "normal"
}
```

**announcements.json** - Slideshow (5-10 seconds each):
```json
{
  "announcements": [
    {
      "id": 1,
      "title": "Important Notice",
      "image": "https://via.placeholder.com/1920x1080",
      "duration": 5
    }
  ]
}
```

**prayer-times.csv** - 9 columns (all prayers):
```
tanggal,bulan,imsak,subuh,terbit,duha,zuhur,asar,magrib,isya
1,January,04:30,04:35,05:50,06:35,12:15,15:30,18:00,19:30
```

**schedule.json** - Murottal/Tarhim times:
```json
{
  "murottal": [
    {
      "day": "thursday",
      "time": "17:00",
      "audioFile": "https://raw.githubusercontent.com/user/repo/main/public-data/audio/murottal.mp3"
    }
  ]
}
```

## 📡 Data Flow

```
GitHub Repository (public-data/)
    ↓ (GitHub API)
TV Display (raw.githubusercontent.com API)
    ↓ (Service Worker)
    ├→ Network Cache (if online)
    └→ Local Storage (if offline)

Admin Panel ↔ GitHub (Octokit) ↔ Repository
```

- TV Display fetches data via GitHub raw content (no API limits for public repos)
- Admin Panel uses GitHub OAuth + Octokit for authenticated writes
- Service Worker handles offline viewing with smart caching strategy
- Manual refresh available; no automatic polling

## 🔊 Audio Features

### Tarhim (Pre-prayer call)
- Plays 6 minutes before each of 7 prayer times
- Prevents duplicate playback same day
- Plays once per prayer time per day

### Murottal
- Configured schedule (e.g., Thursday 17:00, Friday 10:30)
- Pulls audio from GitHub storage
- Plays according to schedule

## 🛠 Tech Stack

### TV Display
- **React** 18.2.0 - UI framework
- **Vite** 4.3.9 - Build tool
- **Service Worker** - Offline support
- **Local Storage** - Data cache fallback
- **hijri-date** 3.4.1 - Islamic calendar

### Admin Panel
- **Next.js** 13.4.0 - React framework
- **NextAuth.js** 4.22.0 - GitHub OAuth
- **@octokit/rest** 19.0.0 - GitHub API
- **React 18.2.0** - UI

### Shared
- **GitHub** - Data repository (no external database)
- **GitHub Pages** - TV display hosting
- **Service Worker** - Offline caching

## 📋 Features Checklist

- ✅ TV Display: Real-time Gregorian + Hijri clocks
- ✅ Prayer Times: 6 prayers displayed + countdown
- ✅ Announcements: Auto-rotating carousel
- ✅ Running Text: Scrolling footer
- ✅ Audio: Tarhim 6 mins before prayer
- ✅ Audio: Murottal on schedule
- ✅ Offline: Service Worker caching
- ✅ Offline: Local Storage fallback
- ✅ Admin: GitHub OAuth login
- ✅ Admin: Dashboard hub
- ✅ Admin: Config editor
- ✅ Admin: Announcements manager
- ✅ Admin: Prayer times editor (table + CSV)
- ✅ Admin: Audio schedule editor
- ✅ GitHub Integration: All data persisted
- ✅ GitHub Pages Deployment: Automatic CI/CD
- ✅ PWA: Fullscreen TV mode

## 🔐 Security

- GitHub OAuth for admin authentication
- No external database (uses GitHub as storage)
- Environment variables for secrets (.env.local)
- Public data repository for TV display
- NextAuth session management

## 📝 License

This project is open-source. Modify and use as needed.

## 🤝 Contributing

Feel free to submit issues and pull requests!

---

**Deployed** ✓ | **Production Ready** ✓ | **Offline Capable** ✓
