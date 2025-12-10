import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { LessonForm } from '@/components/admin/forms/lesson-form'
import type { Lesson, Module } from '@/lib/api/payload-api'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditLessonPage({ params }: Props) {
  const { id } = await params

  if (id === 'new') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
            Create Lesson
          </h1>
          <p className="text-muted-foreground">Add a new lesson to the LMS.</p>
        </div>
        <LessonForm />
      </div>
    )
  }

  const payload = await getPayload({ config })

  let lessonData
  try {
    lessonData = await payload.findByID({ collection: 'lessons', id, depth: 1 })
  } catch {
    notFound()
  }

  if (!lessonData) {
    notFound()
  }

  const moduleData = lessonData.module as { id: string | number; name: string } | null

  const lesson: Lesson = {
    id: String(lessonData.id),
    title: lessonData.title,
    module: moduleData
      ? ({
          id: String(moduleData.id),
          name: moduleData.name,
          displayOrder: 0,
          createdAt: '',
          updatedAt: '',
        } as Module)
      : String(lessonData.module),
    content: lessonData.content,
    pdfUrl: lessonData.pdfUrl || undefined,
    displayOrder: lessonData.displayOrder,
    createdAt: lessonData.createdAt,
    updatedAt: lessonData.updatedAt,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
          Edit Lesson
        </h1>
        <p className="text-muted-foreground">Update lesson content.</p>
      </div>
      <LessonForm initialData={lesson} />
    </div>
  )
}
