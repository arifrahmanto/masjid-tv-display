import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import AnnouncementForm from '../components/AnnouncementForm'
import AuthProvider from '../components/AuthProvider'
import styles from '../styles/announcements.module.css'

function AnnouncementsContent() {
  const { data: session } = useSession()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements')
      const data = await response.json()
      setAnnouncements(data.announcements || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (announcement) => {
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement)
      })

      if (response.ok) {
        setMessage('✓ Announcement saved successfully!')
        setShowForm(false)
        setEditingId(null)
        await fetchAnnouncements()
        setTimeout(() => setMessage(''), 3000)
      } else {
        throw new Error('Failed to save announcement')
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      const response = await fetch('/api/announcements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        setMessage('✓ Announcement deleted!')
        await fetchAnnouncements()
        setTimeout(() => setMessage(''), 3000)
      } else {
        throw new Error('Failed to delete announcement')
      }
    } catch (error) {
      setMessage('✗ Error: ' + error.message)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Announcements Manager</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className={styles.addBtn}>
            + Add Announcement
          </button>
        )}
      </div>

      {message && (
        <div className={`${styles.message} ${message.includes('✗') ? styles.error : styles.success}`}>
          {message}
        </div>
      )}

      {showForm && (
        <AnnouncementForm
          announcement={editingId ? announcements.find(a => a.id === editingId) : null}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingId(null)
          }}
        />
      )}

      <div className={styles.list}>
        {announcements.length === 0 ? (
          <p className={styles.empty}>No announcements yet. Create one to get started!</p>
        ) : (
          announcements.map(announcement => (
            <div key={announcement.id} className={styles.item}>
              <div className={styles.itemContent}>
                <img src={announcement.image} alt={announcement.title} className={styles.itemImage} onError={(e) => e.target.style.display = 'none'} />
                <div className={styles.itemInfo}>
                  <h3>{announcement.title}</h3>
                  <p className={styles.duration}>Duration: {announcement.duration}s</p>
                  <p className={styles.url}>{announcement.image}</p>
                </div>
              </div>
              <div className={styles.itemActions}>
                <button onClick={() => { setEditingId(announcement.id); setShowForm(true); }} className={styles.editBtn}>
                  Edit
                </button>
                <button onClick={() => handleDelete(announcement.id)} className={styles.deleteBtn}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function AnnouncementsPage() {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  return (
    <AuthProvider>
      <AnnouncementsContent />
    </AuthProvider>
  )
}
