import { useEffect, useState } from 'react'
import styles from '../styles/announcements.module.css'

export default function AnnouncementForm({ announcement, onSave, onCancel }) {
  const [form, setForm] = useState({
    id: '',
    title: '',
    image: '',
    duration: 5
  })
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (announcement) {
      setForm(announcement)
      setImagePreview(announcement.image)
    }
  }, [announcement])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }))
    if (name === 'image') {
      setImagePreview(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      await onSave(form)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.formContainer}>
      <h2>{announcement ? 'Edit Announcement' : 'Add New Announcement'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="e.g., Important Notice"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Image URL *</label>
          <input
            type="url"
            name="image"
            value={form.image}
            onChange={handleChange}
            required
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Display Duration (seconds) *</label>
          <input
            type="number"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            min="1"
            max="30"
            required
          />
        </div>

        {imagePreview && (
          <div className={styles.preview}>
            <p>Preview:</p>
            <img src={imagePreview} alt="Preview" onError={() => setImagePreview('')} />
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.buttonGroup}>
          <button type="submit" disabled={saving} className={styles.submitBtn}>
            {saving ? 'Saving...' : 'Save Announcement'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className={styles.cancelBtn}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
