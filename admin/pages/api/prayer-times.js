import { getSession } from 'next-auth/react'
import { Octokit } from '@octokit/rest'

function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return { headers: [], entries: [] }

  const headers = lines[0].split(',').map(h => h.trim())
  const entries = lines.slice(1).map(line => {
    const values = line.split(',')
    const entry = {}
    headers.forEach((header, i) => {
      entry[header] = values[i] ? values[i].trim() : ''
    })
    return entry
  })

  return { headers, entries }
}

function entresToCSV(entries, headers) {
  if (!headers || headers.length === 0) {
    headers = ['tanggal', 'bulan', 'imsak', 'subuh', 'terbit', 'duha', 'zuhur', 'asar', 'magrib', 'isya']
  }

  const rows = [headers.join(',')]
  entries.forEach(entry => {
    const row = headers.map(h => entry[h] || '')
    rows.push(row.join(','))
  })

  return rows.join('\n')
}

export default async function handler(req, res) {
  const session = await getSession({ req })

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const octokit = new Octokit({
        auth: session.accessToken
      })

      const response = await octokit.repos.getContent({
        owner: process.env.GITHUB_REPO_OWNER,
        repo: process.env.GITHUB_REPO_NAME,
        path: process.env.GITHUB_DATA_PATH + '/prayer-times.csv'
      })

      const csv = Buffer.from(response.data.content, 'base64').toString()
      const { headers, entries } = parseCSV(csv)

      return res.status(200).json({ csv, headers, entries })
    } catch (error) {
      console.error('Error fetching prayer times:', error)
      return res.status(200).json({ csv: '', headers: [], entries: [] })
    }
  }

  if (req.method === 'POST') {
    try {
      const { csv } = req.body
      const octokit = new Octokit({
        auth: session.accessToken
      })

      const encodedContent = Buffer.from(csv).toString('base64')
      let sha

      try {
        const response = await octokit.repos.getContent({
          owner: process.env.GITHUB_REPO_OWNER,
          repo: process.env.GITHUB_REPO_NAME,
          path: process.env.GITHUB_DATA_PATH + '/prayer-times.csv'
        })
        sha = response.data.sha
      } catch {
        // File doesn't exist
      }

      await octokit.repos.createOrUpdateFileContents({
        owner: process.env.GITHUB_REPO_OWNER,
        repo: process.env.GITHUB_REPO_NAME,
        path: process.env.GITHUB_DATA_PATH + '/prayer-times.csv',
        message: 'Update prayer times',
        content: encodedContent,
        sha: sha
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error saving prayer times:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
