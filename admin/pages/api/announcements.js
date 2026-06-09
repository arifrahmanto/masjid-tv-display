import { getSession } from 'next-auth/react'
import { Octokit } from '@octokit/rest'

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
        path: process.env.GITHUB_DATA_PATH + '/announcements.json'
      })

      const content = Buffer.from(response.data.content, 'base64').toString()
      const data = JSON.parse(content)

      return res.status(200).json(data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
      return res.status(200).json({ announcements: [] })
    }
  }

  if (req.method === 'POST') {
    try {
      const octokit = new Octokit({
        auth: session.accessToken
      })

      let announcements = []
      let sha

      try {
        const response = await octokit.repos.getContent({
          owner: process.env.GITHUB_REPO_OWNER,
          repo: process.env.GITHUB_REPO_NAME,
          path: process.env.GITHUB_DATA_PATH + '/announcements.json'
        })
        const content = Buffer.from(response.data.content, 'base64').toString()
        announcements = JSON.parse(content).announcements
        sha = response.data.sha
      } catch {
        announcements = []
      }

      const { id, title, image, duration } = req.body
      const newId = id || Math.max(...announcements.map(a => a.id), 0) + 1

      if (id) {
        const index = announcements.findIndex(a => a.id === id)
        if (index >= 0) {
          announcements[index] = { id: newId, title, image, duration }
        }
      } else {
        announcements.push({ id: newId, title, image, duration })
      }

      const updatedContent = JSON.stringify({ announcements }, null, 2)
      const encodedContent = Buffer.from(updatedContent).toString('base64')

      await octokit.repos.createOrUpdateFileContents({
        owner: process.env.GITHUB_REPO_OWNER,
        repo: process.env.GITHUB_REPO_NAME,
        path: process.env.GITHUB_DATA_PATH + '/announcements.json',
        message: 'Update announcements',
        content: encodedContent,
        sha: sha
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error saving announcement:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const octokit = new Octokit({
        auth: session.accessToken
      })

      const response = await octokit.repos.getContent({
        owner: process.env.GITHUB_REPO_OWNER,
        repo: process.env.GITHUB_REPO_NAME,
        path: process.env.GITHUB_DATA_PATH + '/announcements.json'
      })

      const content = Buffer.from(response.data.content, 'base64').toString()
      let { announcements } = JSON.parse(content)
      announcements = announcements.filter(a => a.id !== req.body.id)

      const updatedContent = JSON.stringify({ announcements }, null, 2)
      const encodedContent = Buffer.from(updatedContent).toString('base64')

      await octokit.repos.createOrUpdateFileContents({
        owner: process.env.GITHUB_REPO_OWNER,
        repo: process.env.GITHUB_REPO_NAME,
        path: process.env.GITHUB_DATA_PATH + '/announcements.json',
        message: 'Delete announcement',
        content: encodedContent,
        sha: response.data.sha
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error deleting announcement:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
