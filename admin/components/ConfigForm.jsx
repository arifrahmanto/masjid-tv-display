import { useEffect, useState } from 'react'
import styles from '../styles/config.module.css'

export default function ConfigForm() {
  const [config, setConfig] = useState({
    masjidName: '',
    location: '',
    primaryColor: '#2d5016',
    secondaryColor: '#ffffff',
    textColor: '#000000',
    runningTextColor: '#ffffff',
    runningTextSpeed: 'normal'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Fetch current config
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading config:', err)
        setLoading(false)
      })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setConfig(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        setMessage('✓ Config saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('✗ Error saving config')
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage('✗ Error saving config: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <h1>Mosque Configuration</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Mosque Name *</label>
          <input
            type="text"
            name="masjidName"
            value={config.masjidName}
            onChange={handleChange}
            required
            placeholder="e.g., Masjid Al-Ikhlas"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Location *</label>
          <input
            type="text"
            name="location"
            value={config.location}
            onChange={handleChange}
            required
            placeholder="e.g., Jakarta, Indonesia"
          />
        </div>

        <div className={styles.colorGroup}>
          <div className={styles.formGroup}>
            <label>Primary Color</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                name="primaryColor"
                value={config.primaryColor}
                onChange={handleChange}
              />
              <input
                type="text"
                name="primaryColor"
                value={config.primaryColor}
                onChange={handleChange}
                placeholder="#2d5016"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Secondary Color</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                name="secondaryColor"
                value={config.secondaryColor}
                onChange={handleChange}
              />
              <input
                type="text"
                name="secondaryColor"
                value={config.secondaryColor}
                onChange={handleChange}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>

        <div className={styles.colorGroup}>
          <div className={styles.formGroup}>
            <label>Text Color</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                name="textColor"
                value={config.textColor}
                onChange={handleChange}
              />
              <input
                type="text"
                name="textColor"
                value={config.textColor}
                onChange={handleChange}
                placeholder="#000000"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Running Text Color</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                name="runningTextColor"
                value={config.runningTextColor}
                onChange={handleChange}
              />
              <input
                type="text"
                name="runningTextColor"
                value={config.runningTextColor}
                onChange={handleChange}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Running Text Speed</label>
          <select
            name="runningTextSpeed"
            value={config.runningTextSpeed}
            onChange={handleChange}
          >
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
          </select>
        </div>

        {message && (
          <div className={`${styles.message} ${message.includes('✗') ? styles.error : styles.success}`}>
            {message}
          </div>
        )}

        <button type="submit" disabled={saving} className={styles.submitBtn}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  )
}
