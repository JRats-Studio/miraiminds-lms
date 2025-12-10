import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import type { User } from '@/lib/api/payload-api'

export const metadata = {
  title: 'Admin Dashboard - Mirai Minds LMS',
  description: 'Admin dashboard for managing Mirai Minds LMS',
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth check
  const payload = await getPayload({ config })
  const headersList = await headers()

  const { user: authUser } = await payload.auth({ headers: headersList })

  // Redirect if not authenticated
  if (!authUser) {
    redirect('/login')
  }

  // Fetch full user data with role
  const fullUser = await payload.findByID({
    collection: 'users',
    id: authUser.id,
  })

  // Redirect if not an admin
  if (fullUser.role !== 'admin') {
    redirect('/dashboard')
  }

  // Cast to our User type
  const user: User = {
    id: String(fullUser.id),
    email: fullUser.email,
    name: fullUser.name,
    role: fullUser.role as 'admin' | 'student',
    createdAt: fullUser.createdAt,
    updatedAt: fullUser.updatedAt,
  }

  return (
    <SidebarProvider>
      <AdminSidebar user={user} />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  )
}
