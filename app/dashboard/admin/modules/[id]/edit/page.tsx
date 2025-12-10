import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { ModuleForm } from '@/components/admin/forms/module-form'
import type { Module, Subject, User } from '@/lib/api/payload-api'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditModulePage({ params }: Props) {
  const { id } = await params

  if (id === 'new') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
            Create Module
          </h1>
          <p className="text-muted-foreground">Add a new learning module to the LMS.</p>
        </div>
        <ModuleForm />
      </div>
    )
  }

  const payload = await getPayload({ config })

  let moduleData
  try {
    moduleData = await payload.findByID({ collection: 'modules', id, depth: 1 })
  } catch {
    notFound()
  }

  if (!moduleData) {
    notFound()
  }

  const subjectData = moduleData.subject as { id: string | number; name: string } | null
  const usersData = moduleData.allowedUsers as Array<{
    id: string | number
    email: string
    name: string
  }> | null

  const moduleRecord: Module = {
    id: String(moduleData.id),
    name: moduleData.name,
    subject: subjectData
      ? ({
          id: String(subjectData.id),
          name: subjectData.name,
          displayOrder: 0,
          createdAt: '',
          updatedAt: '',
        } as Subject)
      : String(moduleData.subject),
    description: moduleData.description,
    videoUrl: moduleData.videoUrl || undefined,
    allowedUsers: usersData
      ? usersData.map(
          (u) =>
            ({
              id: String(u.id),
              email: u.email,
              name: u.name,
              role: 'student' as const,
              createdAt: '',
              updatedAt: '',
            }) as User
        )
      : [],
    displayOrder: moduleData.displayOrder,
    createdAt: moduleData.createdAt,
    updatedAt: moduleData.updatedAt,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
          Edit Module
        </h1>
        <p className="text-muted-foreground">Update module information and student access.</p>
      </div>
      <ModuleForm initialData={moduleRecord} />
    </div>
  )
}
