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
        path: process.env.GITHUB_DATA_PATH + '/config.json'
      })

      const content = Buffer.from(response.data.content, 'base64').toString()
      const config = JSON.parse(content)

      return res.status(200).json(config)
    } catch (error) {
      console.error('Error fetching config:', error)
      // Return default config if file doesn't exist
      return res.status(200).json({
        masjidName: 'Masjid Al-Ikhlas',
        location: 'Jakarta, Indonesia',
        primaryColor: '#2d5016',
        secondaryColor: '#ffffff',
        textColor: '#000000',
        runningTextColor: '#ffffff',
        runningTextSpeed: 'normal'
      })
    }
  }

  if (req.method === 'POST') {
    try {
      const octokit = new Octokit({
        auth: session.accessToken
      })

      const configContent = JSON.stringify(req.body, null, 2)
      const encodedContent = Buffer.from(configContent).toString('base64')

      // Get current file SHA for update
      let sha
      try {
        const response = await octokit.repos.getContent({
          owner: process.env.GITHUB_REPO_OWNER,
          repo: process.env.GITHUB_REPO_NAME,
          path: process.env.GITHUB_DATA_PATH + '/config.json'
        })
        sha = response.data.sha
      } catch {
        // File doesn't exist, create new
      }

      await octokit.repos.createOrUpdateFileContents({
        owner: process.env.GITHUB_REPO_OWNER,
        repo: process.env.GITHUB_REPO_NAME,
        path: process.env.GITHUB_DATA_PATH + '/config.json',
        message: 'Update mosque configuration',
        content: encodedContent,
        sha: sha
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error saving config:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
