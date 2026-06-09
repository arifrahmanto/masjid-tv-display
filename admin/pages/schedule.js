import { useSession } from 'next-auth/react'
import ScheduleForm from '../components/ScheduleForm'
import AuthProvider from '../components/AuthProvider'

export default function SchedulePage() {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  return (
    <AuthProvider>
      <ScheduleForm />
    </AuthProvider>
  )
}
