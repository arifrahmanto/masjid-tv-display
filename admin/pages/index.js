import { useSession } from 'next-auth/react'
import Dashboard from '../components/Dashboard'
import AuthProvider from '../components/AuthProvider'

export default function Home() {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  )
}
