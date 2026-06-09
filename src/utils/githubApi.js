// src/utils/githubApi.js
import { GITHUB_RAW_URL, CACHE_KEYS } from './constants'

export async function fetchFromGitHub(fileKey) {
  const url = `${GITHUB_RAW_URL}/${fileKey}`
  
  try {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.text()
  } catch (error) {
    console.error(`Failed to fetch ${fileKey}:`, error)
    throw error
  }
}

export async function fetchJSON(fileKey) {
  const data = await fetchFromGitHub(fileKey)
  return JSON.parse(data)
}

export async function fetchCSV(fileKey) {
  const data = await fetchFromGitHub(fileKey)
  return parseCSV(data)
}

export function parseCSV(csvString) {
  const lines = csvString.trim().split('\n')
  const header = lines[0].split(',').map(h => h.trim())
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    const obj = {}
    header.forEach((key, idx) => {
      obj[key] = values[idx]
    })
    return obj
  })
  return { header, rows }
}

export async function fetchAudio(fileKey) {
  const url = `${GITHUB_RAW_URL}/${fileKey}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`)
  return response
}
