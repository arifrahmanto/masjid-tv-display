import { useSession } from 'next-auth/react'
import PrayerTimesForm from '../components/PrayerTimesForm'
import AuthProvider from '../components/AuthProvider'

export default function PrayerTimesPage() {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  return (
    <AuthProvider>
      <PrayerTimesForm />
    </AuthProvider>
  )
}
