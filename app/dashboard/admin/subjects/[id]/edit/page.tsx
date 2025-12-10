import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { SubjectForm } from '@/components/admin/forms/subject-form'
import type { Subject, Grade } from '@/lib/api/payload-api'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditSubjectPage({ params }: Props) {
  const { id } = await params

  if (id === 'new') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
            Create Subject
          </h1>
          <p className="text-muted-foreground">Add a new subject to the LMS.</p>
        </div>
        <SubjectForm />
      </div>
    )
  }

  const payload = await getPayload({ config })

  try {
    const subjectData = await payload.findByID({ collection: 'subjects', id, depth: 1 })

    const gradeData = subjectData.grade as { id: string | number; name: string } | null

    const subject: Subject = {
      id: String(subjectData.id),
      name: subjectData.name,
      grade: gradeData
        ? {
            id: String(gradeData.id),
            name: gradeData.name,
            displayOrder: 0,
            createdAt: '',
            updatedAt: '',
          }
        : String(subjectData.grade),
      description: subjectData.description || undefined,
      displayOrder: subjectData.displayOrder,
      createdAt: subjectData.createdAt,
      updatedAt: subjectData.updatedAt,
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
            Edit Subject
          </h1>
          <p className="text-muted-foreground">Update subject information.</p>
        </div>
        <SubjectForm initialData={subject} />
      </div>
    )
  } catch {
    notFound()
  }
}
