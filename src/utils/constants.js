// src/utils/constants.js
export const GITHUB_REPO_OWNER = 'your-username'
export const GITHUB_REPO_NAME = 'masjid-tv-display'
export const GITHUB_BRANCH = 'main'
export const GITHUB_DATA_PATH = 'public-data'

export const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/${GITHUB_DATA_PATH}`

export const CACHE_NAMES = {
  STATIC: 'masjid-tv-static-v1',
  DYNAMIC: 'masjid-tv-dynamic-v1'
}

export const CACHE_KEYS = {
  CONFIG: 'config.json',
  ANNOUNCEMENTS: 'announcements.json',
  PRAYER_TIMES: 'prayer-times.csv',
  SCHEDULE: 'schedule.json',
  TARHIM: 'audio/tarhim.mp3',
  MUROTTAL: 'audio/murottal.mp3'
}

export const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-awwal', 'Rabi al-thani',
  'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
]

export const PRAYER_TIMES_CSV_HEADER = ['tanggal', 'bulan', 'imsak', 'subuh', 'terbit', 'duha', 'zuhur', 'asar', 'magrib', 'isya']
export const DISPLAYED_PRAYER_TIMES = ['subuh', 'duha', 'zuhur', 'asar', 'magrib', 'isya']
