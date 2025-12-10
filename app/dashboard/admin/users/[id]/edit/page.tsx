import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { UserForm } from '@/components/admin/forms/user-form'
import type { User } from '@/lib/api/payload-api'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditUserPage({ params }: Props) {
  const { id } = await params

  // Handle "new" as creating a new user
  if (id === 'new') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
            Create User
          </h1>
          <p className="text-muted-foreground">Add a new user to the system.</p>
        </div>
        <UserForm />
      </div>
    )
  }

  const payload = await getPayload({ config })

  try {
    const userData = await payload.findByID({ collection: 'users', id })

    const user: User = {
      id: String(userData.id),
      email: userData.email,
      name: userData.name,
      role: userData.role as 'admin' | 'student',
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
            Edit User
          </h1>
          <p className="text-muted-foreground">Update user information.</p>
        </div>
        <UserForm initialData={user} />
      </div>
    )
  } catch {
    notFound()
  }
}
