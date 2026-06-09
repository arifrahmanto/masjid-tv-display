import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import styles from './AuthProvider.module.css'

export default function AuthProvider({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated' && router.pathname !== '/signin') {
      router.push('/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div>
      <div className={styles.topbar}>
        <div className={styles.userInfo}>
          <img src={session.user.image} alt="User Avatar" className={styles.avatar} />
          <span>{session.user.name}</span>
        </div>
        <button onClick={() => signOut()} className={styles.logoutBtn}>
          Logout
        </button>
      </div>
      {children}
    </div>
  )
}
