import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Lesson, Module, Subject, Grade } from '@/lib/api/payload-api'
import Breadcrumbs from '@/components/Breadcrumbs'
import DrivePDFViewer from '@/components/DrivePDFViewer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

interface LessonWithModule extends Lesson {
  module: Module | string
}

async function fetchLesson(id: string) {
  const cookieStore = await cookies()
  const res = await fetch(`${serverUrl}/api/lessons/${id}?depth=2`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  })

  if (res.status === 401) redirect('/login')
  if (res.status === 404) notFound()
  if (res.status === 403) redirect('/dashboard')
  if (!res.ok) throw new Error('Failed to load lesson')

  return res.json() as Promise<LessonWithModule>
}

async function fetchLessonsForModule(moduleId: string) {
  const params = new URLSearchParams()
  params.set('sort', 'displayOrder')
  params.set(
    'where',
    JSON.stringify({
      module: { equals: moduleId },
    })
  )

  const cookieStore = await cookies()
  const res = await fetch(`${serverUrl}/api/lessons?${params.toString()}`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  })

  if (res.status === 401) redirect('/login')
  if (res.status === 403) redirect('/dashboard')
  if (!res.ok) throw new Error('Failed to load lessons')

  return res.json() as Promise<{ docs: Lesson[] }>
}

function toPlainText(content: unknown) {
  if (!content) return 'Content coming soon.'
  if (typeof content === 'string') return content
  return 'Rich text content is not yet rendered.'
}

function findPrevNext(lessons: Lesson[], currentId: string) {
  const index = lessons.findIndex((l) => l.id === currentId)
  return {
    prev: index > 0 ? lessons[index - 1] : null,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null,
  }
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lesson = await fetchLesson(id)
  const moduleRecord = lesson.module as Module
  const subject = (moduleRecord?.subject || null) as Subject | string | null
  const grade = subject && typeof subject !== 'string' ? ((subject.grade || null) as Grade | string | null) : null

  const lessonsData = await fetchLessonsForModule(moduleRecord.id)
  const lessons = lessonsData.docs || []
  const { prev, next } = findPrevNext(lessons, lesson.id)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <Breadcrumbs
        items={[
          grade && typeof grade !== 'string'
            ? { label: grade.name, href: `/grades/${grade.id}` }
            : { label: 'Grade' },
          subject && typeof subject !== 'string'
            ? { label: subject.name, href: `/subjects/${subject.id}` }
            : { label: 'Subject' },
          { label: moduleRecord.name, href: `/modules/${moduleRecord.id}` },
          { label: lesson.title },
        ]}
      />

      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Lesson</p>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>Lesson details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="leading-relaxed text-muted-foreground">{toPlainText(lesson.content)}</p>

          {lesson.pdfUrl && (
            <DrivePDFViewer url={lesson.pdfUrl} title={lesson.title} />
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-wrap gap-4 justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase text-muted-foreground">Navigation</p>
          <div className="flex gap-4">
            {prev ? (
              <Link href={`/lessons/${prev.id}`} className="text-primary hover:underline">
                ← {prev.title}
              </Link>
            ) : (
              <span className="text-muted-foreground">No previous lesson</span>
            )}
            {next ? (
              <Link href={`/lessons/${next.id}`} className="text-primary hover:underline">
                {next.title} →
              </Link>
            ) : (
              <span className="text-muted-foreground">No next lesson</span>
            )}
          </div>
        </div>

        <Link href={`/modules/${moduleRecord.id}`} className="text-primary hover:underline">
          Back to module
        </Link>
      </div>
    </div>
  )
}

