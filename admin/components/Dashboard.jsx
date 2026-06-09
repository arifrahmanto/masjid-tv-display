import Link from 'next/link'
import styles from '../styles/dashboard.module.css'

export default function Dashboard() {
  const sections = [
    {
      id: 'config',
      title: 'Mosque Configuration',
      description: 'Manage mosque name, location, colors, and settings',
      icon: '⚙️',
      link: '/config'
    },
    {
      id: 'announcements',
      title: 'Announcements',
      description: 'Create and manage slideshow announcements',
      icon: '📢',
      link: '/announcements'
    },
    {
      id: 'prayer-times',
      title: 'Prayer Times',
      description: 'Set daily prayer times (9 prayer columns)',
      icon: '🕌',
      link: '/prayer-times'
    },
    {
      id: 'schedule',
      title: 'Audio Schedule',
      description: 'Configure murottal and tarhim playback times',
      icon: '🎵',
      link: '/schedule'
    }
  ]

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p>Manage all content for your Masjid TV Display</p>
      </div>

      <div className={styles.grid}>
        {sections.map(section => (
          <Link href={section.link} key={section.id}>
            <a className={styles.card}>
              <div className={styles.icon}>{section.icon}</div>
              <h2>{section.title}</h2>
              <p>{section.description}</p>
              <span className={styles.arrow}>→</span>
            </a>
          </Link>
        ))}
      </div>

      <div className={styles.info}>
        <h3>Quick Info</h3>
        <ul>
          <li>📁 All data stored in GitHub repository</li>
          <li>☁️ Changes automatically synced to GitHub</li>
          <li>📺 TV display refreshes every minute</li>
          <li>⚡ Service Worker enables offline viewing</li>
        </ul>
      </div>
    </div>
  )
}
