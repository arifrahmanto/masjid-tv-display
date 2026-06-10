import { useEffect, useState } from 'react'
import styles from '../styles/announcements.module.css'

export default function AnnouncementForm({ announcement, onSave, onCancel }) {
  const [form, setForm] = useState({
    id: '',
    title: '',
    image: '',
    duration: 5,
    active: true
  })
  const [imagePreview, setImagePreview] = useState('')
  const [availableImages, setAvailableImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (announcement) {
      setForm(announcement)
      setImagePreview(buildImageUrl(announcement.image))
    }
    fetchAvailableImages()
  }, [announcement])

  const buildImageUrl = (filename) => {
    if (!filename) return ''
    if (filename.startsWith('http')) return filename
    return `https://raw.githubusercontent.com/${process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO_NAME}/main/public-data/images/${filename}`
  }

  const fetchAvailableImages = async () => {
    try {
      const response = await fetch('/api/upload')
      const data = await response.json()
      setAvailableImages(data.images || [])
    } catch (error) {
      console.error('Error fetching images:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'duration' ? parseInt(value) : value)
    }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)

    try {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        throw new Error('File must be JPG, PNG, or GIF')
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      // Read file as base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1]
        const filename = `${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.-]/g, '')}`

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename,
            fileData: base64Data
          })
        })

        if (response.ok) {
          const data = await response.json()
          setForm(prev => ({ ...prev, image: data.filename }))
          setImagePreview(data.imageUrl)
          await fetchAvailableImages()
          setError('')
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSelectImage = (filename, url) => {
    setForm(prev => ({ ...prev, image: filename }))
    setImagePreview(url)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'duration' ? parseInt(value) : value)
    }))
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
          <label>
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
            Active (Display in Slideshow)
          </label>
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

        <div className={styles.formGroup}>
          <label>Image *</label>
          <p className={styles.hint}>Upload new image or select from existing</p>
          
          <div className={styles.uploadArea}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleFileUpload}
              disabled={uploading}
              className={styles.fileInput}
            />
            {uploading && <p className={styles.uploadingText}>Uploading...</p>}
          </div>

          {availableImages.length > 0 && (
            <div className={styles.imageGrid}>
              <p className={styles.label}>Available Images:</p>
              {availableImages.map((img) => (
                <div
                  key={img.name}
                  className={`${styles.imageItem} ${form.image === img.name ? styles.selected : ''}`}
                  onClick={() => handleSelectImage(img.name, img.url)}
                >
                  <img src={img.url} alt={img.name} />
                  <p className={styles.imageName}>{img.name.slice(0, 20)}...</p>
                  {form.image === img.name && <span className={styles.checkmark}>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {imagePreview && (
          <div className={styles.preview}>
            <p>Preview:</p>
            <img src={imagePreview} alt="Preview" onError={() => setImagePreview('')} />
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.buttonGroup}>
          <button type="submit" disabled={saving || uploading} className={styles.submitBtn}>
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

