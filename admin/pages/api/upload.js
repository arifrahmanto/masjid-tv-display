import { getSession } from 'next-auth/react'
import { Octokit } from '@octokit/rest'

export default async function handler(req, res) {
  const session = await getSession({ req })

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    try {
      const { filename, fileData } = req.body

      if (!filename || !fileData) {
        return res.status(400).json({ error: 'Missing filename or fileData' })
      }

      // Validate filename (allow only safe characters)
      if (!/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif)$/.test(filename)) {
        return res.status(400).json({ error: 'Invalid filename format. Use only alphanumeric, dots, dashes, underscores. Allowed: jpg, jpeg, png, gif' })
      }

      const octokit = new Octokit({
        auth: session.accessToken
      })

      // Check if file already exists and get SHA if it does
      let sha

      try {
        const response = await octokit.repos.getContent({
          owner: process.env.GITHUB_REPO_OWNER,
          repo: process.env.GITHUB_REPO_NAME,
          path: `${process.env.GITHUB_DATA_PATH}/images/${filename}`
        })
        sha = response.data.sha
      } catch (error) {
        // File doesn't exist yet
        sha = undefined
      }

      // Upload file to GitHub
      await octokit.repos.createOrUpdateFileContents({
        owner: process.env.GITHUB_REPO_OWNER,
        repo: process.env.GITHUB_REPO_NAME,
        path: `${process.env.GITHUB_DATA_PATH}/images/${filename}`,
        message: `Upload announcement image: ${filename}`,
        content: fileData, // Base64 encoded
        sha: sha
      })

      // Return the GitHub raw content URL
      const imageUrl = `https://raw.githubusercontent.com/${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}/${process.env.GITHUB_BRANCH}/${process.env.GITHUB_DATA_PATH}/images/${filename}`

      return res.status(200).json({
        success: true,
        filename,
        imageUrl
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === 'GET') {
    try {
      const octokit = new Octokit({
        auth: session.accessToken
      })

      // List all images in the images folder
      const response = await octokit.repos.getContent({
        owner: process.env.GITHUB_REPO_OWNER,
        repo: process.env.GITHUB_REPO_NAME,
        path: `${process.env.GITHUB_DATA_PATH}/images`
      })

      const images = Array.isArray(response.data)
        ? response.data
          .filter(item => item.type === 'file' && /\.(jpg|jpeg|png|gif)$/i.test(item.name))
          .map(item => ({
            name: item.name,
            url: `https://raw.githubusercontent.com/${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}/${process.env.GITHUB_BRANCH}/${process.env.GITHUB_DATA_PATH}/images/${item.name}`
          }))
        : []

      return res.status(200).json({ images })
    } catch (error) {
      console.error('Error listing images:', error)
      return res.status(200).json({ images: [] })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
