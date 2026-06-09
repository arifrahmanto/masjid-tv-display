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
        path: process.env.GITHUB_DATA_PATH + '/schedule.json'
      })

      const content = Buffer.from(response.data.content, 'base64').toString()
      const data = JSON.parse(content)

      return res.status(200).json(data)
    } catch (error) {
      console.error('Error fetching schedule:', error)
      return res.status(200).json({ murottal: [] })
    }
  }

  if (req.method === 'POST') {
    try {
      const octokit = new Octokit({
        auth: session.accessToken
      })

      const scheduleContent = JSON.stringify(req.body, null, 2)
      const encodedContent = Buffer.from(scheduleContent).toString('base64')

      let sha

      try {
        const response = await octokit.repos.getContent({
          owner: process.env.GITHUB_REPO_OWNER,
          repo: process.env.GITHUB_REPO_NAME,
          path: process.env.GITHUB_DATA_PATH + '/schedule.json'
        })
        sha = response.data.sha
      } catch {
        // File doesn't exist
      }

      await octokit.repos.createOrUpdateFileContents({
        owner: process.env.GITHUB_REPO_OWNER,
        repo: process.env.GITHUB_REPO_NAME,
        path: process.env.GITHUB_DATA_PATH + '/schedule.json',
        message: 'Update audio schedule',
        content: encodedContent,
        sha: sha
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error saving schedule:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
