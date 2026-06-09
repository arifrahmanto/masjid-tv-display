import { useEffect, useState } from 'react'
import styles from '../styles/schedule.module.css'

export default function ScheduleForm() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [newEntry, setNewEntry] = useState({
    day: 'thursday',
    time: '17:00',
    audioFile: ''
  })

  const DAYS = [
    { value: 'sunday', label: 'Sunday' },
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' }
  ]

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedule')
      const data = await response.json()
      setSchedules(data.murottal || [])
    } catch (error) {
      console.error('Error fetching schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEntry = async (e) => {
    e.preventDefault()
    setMessage('')

    if (!newEntry.day || !newEntry.time || !newEntry.audioFile) {
      setMessage('✗ Please fill in all fields')
      return
    }

    setSaving(true)

    try {
      const updatedSchedules = [...schedules, { ...newEntry }]

      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ murottal: updatedSchedules })
      })

      if (response.ok) {
        setMessage('✓ Schedule entry added!')
        setNewEntry({ day: 'thursday', time: '17:00', audioFile: '' })
        await fetchSchedules()
        setTimeout(() => setMessage(''), 3000)
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      setMessage('✗ Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (index) => {
    if (!confirm('Are you sure you want to delete this schedule entry?')) return

    setSaving(true)
    setMessage('')

    try {
      const updatedSchedules = schedules.filter((_, i) => i !== index)

      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ murottal: updatedSchedules })
      })

      if (response.ok) {
        setMessage('✓ Schedule entry deleted!')
        await fetchSchedules()
        setTimeout(() => setMessage(''), 3000)
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      setMessage('✗ Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEditTime = async (index, field, value) => {
    const updated = [...schedules]
    updated[index][field] = value
    setSchedules(updated)

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ murottal: updated })
      })

      if (response.ok) {
        setMessage('✓ Schedule updated!')
        setTimeout(() => setMessage(''), 2000)
      }
    } catch (error) {
      setMessage('✗ Error saving schedule')
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <h1>Audio Schedule</h1>

      {message && (
        <div className={`${styles.message} ${message.includes('✗') ? styles.error : styles.success}`}>
          {message}
        </div>
      )}

      <div className={styles.section}>
        <h2>Current Schedule</h2>
        {schedules.length === 0 ? (
          <p className={styles.empty}>No schedule entries yet</p>
        ) : (
          <div className={styles.list}>
            {schedules.map((entry, idx) => (
              <div key={idx} className={styles.item}>
                <div className={styles.itemFields}>
                  <div className={styles.field}>
                    <label>Day:</label>
                    <select
                      value={entry.day}
                      onChange={(e) => handleEditTime(idx, 'day', e.target.value)}
                      className={styles.itemSelect}
                    >
                      {DAYS.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Time:</label>
                    <input
                      type="time"
                      value={entry.time}
                      onChange={(e) => handleEditTime(idx, 'time', e.target.value)}
                      className={styles.itemInput}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Audio File URL:</label>
                    <input
                      type="url"
                      value={entry.audioFile}
                      onChange={(e) => handleEditTime(idx, 'audioFile', e.target.value)}
                      className={styles.itemInput}
                      placeholder="https://raw.githubusercontent.com/..."
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(idx)}
                  className={styles.deleteBtn}
                  disabled={saving}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>Add New Schedule Entry</h2>
        <form onSubmit={handleAddEntry} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Day *</label>
            <select
              value={newEntry.day}
              onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })}
            >
              {DAYS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Time (HH:MM) *</label>
            <input
              type="time"
              value={newEntry.time}
              onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Audio File URL *</label>
            <input
              type="url"
              value={newEntry.audioFile}
              onChange={(e) => setNewEntry({ ...newEntry, audioFile: e.target.value })}
              placeholder="https://raw.githubusercontent.com/user/repo/main/public-data/audio/murottal.mp3"
            />
          </div>

          <button type="submit" disabled={saving} className={styles.submitBtn}>
            {saving ? 'Adding...' : 'Add Schedule Entry'}
          </button>
        </form>
      </div>
    </div>
  )
}
