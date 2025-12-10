import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { GradeForm } from '@/components/admin/forms/grade-form'
import type { Grade } from '@/lib/api/payload-api'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditGradePage({ params }: Props) {
  const { id } = await params

  if (id === 'new') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
            Create Grade
          </h1>
          <p className="text-muted-foreground">Add a new grade level to the LMS.</p>
        </div>
        <GradeForm />
      </div>
    )
  }

  const payload = await getPayload({ config })

  let gradeData
  try {
    gradeData = await payload.findByID({ collection: 'grades', id })
  } catch {
    notFound()
  }

  if (!gradeData) {
    notFound()
  }

  const grade: Grade = {
    id: String(gradeData.id),
    name: gradeData.name,
    description: gradeData.description || undefined,
    displayOrder: gradeData.displayOrder,
    createdAt: gradeData.createdAt,
    updatedAt: gradeData.updatedAt,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
          Edit Grade
        </h1>
        <p className="text-muted-foreground">Update grade information.</p>
      </div>
      <GradeForm initialData={grade} />
    </div>
  )
}
