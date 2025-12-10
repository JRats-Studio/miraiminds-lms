import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Mirai Minds LMS',
  description: 'Mirai Minds LMS Dashboard',
}

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
