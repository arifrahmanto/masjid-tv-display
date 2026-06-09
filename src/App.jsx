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
