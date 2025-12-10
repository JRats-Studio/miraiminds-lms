import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Mirai Minds LMS',
  description: 'Sign in to Mirai Minds LMS',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
