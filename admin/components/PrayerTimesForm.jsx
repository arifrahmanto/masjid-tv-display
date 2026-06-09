import { useEffect, useState } from 'react'
import styles from '../styles/prayer-times.module.css'

export default function PrayerTimesForm() {
  const [entries, setEntries] = useState([])
  const [csvText, setCsvText] = useState('')
  const [mode, setMode] = useState('table')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const PRAYER_COLUMNS = ['tanggal', 'bulan', 'imsak', 'subuh', 'terbit', 'duha', 'zuhur', 'asar', 'magrib', 'isya']
  const PRAYER_DISPLAY = ['tanggal', 'bulan', 'imsak', 'subuh', 'terbit', 'duha', 'zuhur', 'asar', 'magrib', 'isya']

  useEffect(() => {
    fetchPrayerTimes()
  }, [])

  const fetchPrayerTimes = async () => {
    try {
      const response = await fetch('/api/prayer-times')
      const data = await response.json()
      setEntries(data.entries || [])
      setCsvText(data.csv || '')
    } catch (error) {
      console.error('Error fetching prayer times:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (index, column, value) => {
    const newEntries = [...entries]
    newEntries[index][column] = value
    setEntries(newEntries)
  }

  const handleCsvChange = (e) => {
    setCsvText(e.target.value)
  }

  const parseCsv = (text) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim())
    return lines.slice(1).map(line => {
      const values = line.split(',')
      const entry = {}
      headers.forEach((header, i) => {
        entry[header] = values[i] ? values[i].trim() : ''
      })
      return entry
    })
  }

  const handleImportCsv = () => {
    try {
      const parsed = parseCsv(csvText)
      if (parsed.length > 0) {
        setEntries(parsed)
        setMode('table')
        setMessage('✓ CSV imported successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('✗ Invalid CSV format')
      }
    } catch (error) {
      setMessage('✗ Error parsing CSV: ' + error.message)
    }
  }

  const generateCsv = () => {
    if (entries.length === 0) return ''

    const headers = PRAYER_COLUMNS
    const rows = [headers.join(',')]

    entries.forEach(entry => {
      const row = headers.map(h => entry[h] || '')
      rows.push(row.join(','))
    })

    return rows.join('\n')
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const csv = generateCsv()

      const response = await fetch('/api/prayer-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv })
      })

      if (response.ok) {
        setMessage('✓ Prayer times saved successfully!')
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

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <h1>Prayer Times Editor</h1>

      {message && (
        <div className={`${styles.message} ${message.includes('✗') ? styles.error : styles.success}`}>
          {message}
        </div>
      )}

      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeBtn} ${mode === 'table' ? styles.active : ''}`}
          onClick={() => setMode('table')}
        >
          Table Editor
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'csv' ? styles.active : ''}`}
          onClick={() => setMode('csv')}
        >
          CSV Editor
        </button>
      </div>

      {mode === 'table' && (
        <div className={styles.tableMode}>
          <div className={styles.tableScroll}>
            <table>
              <thead>
                <tr>
                  {PRAYER_DISPLAY.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr key={idx}>
                    {PRAYER_DISPLAY.map(col => (
                      <td key={`${idx}-${col}`}>
                        <input
                          type="text"
                          value={entry[col] || ''}
                          onChange={(e) => handleTableChange(idx, col, e.target.value)}
                          placeholder="--:--"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mode === 'csv' && (
        <div className={styles.csvMode}>
          <textarea
            value={csvText}
            onChange={handleCsvChange}
            placeholder="tanggal,bulan,imsak,subuh,terbit,duha,zuhur,asar,magrib,isya&#10;1,January,04:30,04:35,05:50,06:35,12:15,15:30,18:00,19:30"
            rows="15"
          />
          <button onClick={handleImportCsv} className={styles.importBtn}>
            Import CSV
          </button>
        </div>
      )}

      <div className={styles.actions}>
        <button
          onClick={handleSave}
          disabled={saving}
          className={styles.saveBtn}
        >
          {saving ? 'Saving...' : 'Save Prayer Times'}
        </button>
      </div>
    </div>
  )
}
