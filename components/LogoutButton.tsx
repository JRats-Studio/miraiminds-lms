'use client'

import { useRouter } from 'next/navigation'
import { logout } from '@/lib/api/payload-api'

interface LogoutButtonProps {
  className?: string
  children?: React.ReactNode
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className={className}
    >
      {children || 'Logout'}
    </button>
  )
}
