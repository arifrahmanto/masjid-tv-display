// src/utils/hijriDate.js
import HijriDate from 'hijri-date'
import { HIJRI_MONTHS } from './constants'

export function convertToHijri(date = new Date()) {
  const hijri = new HijriDate(date)
  const day = hijri.getDate()
  const month = hijri.getMonth() + 1
  const year = hijri.getFullYear()
  
  return {
    day,
    month,
    year,
    monthName: HIJRI_MONTHS[month - 1],
    formatted: `${day} ${HIJRI_MONTHS[month - 1]} ${year} H`
  }
}

export function formatGregorianDate(date = new Date()) {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  
  const dayName = days[date.getDay()]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  
  return `${dayName}, ${day} ${month} ${year}`
}

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false
  })
}
