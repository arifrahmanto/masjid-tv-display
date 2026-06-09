import { useSession } from 'next-auth/react'
import ConfigForm from '../components/ConfigForm'
import AuthProvider from '../components/AuthProvider'

export default function ConfigPage() {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  return (
    <AuthProvider>
      <ConfigForm />
    </AuthProvider>
  )
}
