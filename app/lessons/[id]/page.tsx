import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, PenLine, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Lesson, Module, Subject, Grade } from '@/lib/api/payload-api'
import Breadcrumbs from '@/components/Breadcrumbs'
import DriveImageViewer from '@/components/DriveImageViewer'
import DrivePDFViewer from '@/components/DrivePDFViewer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
  if (!content) return null
  if (typeof content === 'string') return content
  return null
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
  const contentText = toPlainText(lesson.content)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumbs */}
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

      {/* Cover Image */}
      <DriveImageViewer
        url={lesson.coverImageUrl}
        alt={`Cover image for ${lesson.title}`}
        className="shadow-xl"
      />

      {/* Lesson Header Card */}
      <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/30">
        <CardHeader className="pb-4">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">
            Lesson
          </p>
          <CardTitle
            className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-header)' }}
          >
            {lesson.title}
          </CardTitle>
        </CardHeader>
        {contentText && (
          <CardContent>
            <p
              className="text-muted-foreground leading-relaxed"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {contentText}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Content PDF Section */}
      <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <CardTitle
              className="text-xl"
              style={{ fontFamily: 'var(--font-header)' }}
            >
              Lesson Content
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <DrivePDFViewer url={lesson.contentPdfUrl} />
        </CardContent>
      </Card>

      {/* Activity PDF Section */}
      <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="bg-accent/5 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <PenLine className="h-5 w-5 text-accent" />
            </div>
            <CardTitle
              className="text-xl"
              style={{ fontFamily: 'var(--font-header)' }}
            >
              Student Activity
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <DrivePDFViewer url={lesson.activityPdfUrl} />
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card className="border-none shadow-sm bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            {prev ? (
              <Button asChild variant="ghost" className="gap-2">
                <Link href={`/lessons/${prev.id}`}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">{prev.title}</span>
                  <span className="sm:hidden">Previous</span>
                </Link>
              </Button>
            ) : (
              <div />
            )}

            <Button asChild variant="outline" size="sm">
              <Link href={`/modules/${moduleRecord.id}`}>
                Back to Module
              </Link>
            </Button>

            {next ? (
              <Button asChild variant="ghost" className="gap-2">
                <Link href={`/lessons/${next.id}`}>
                  <span className="hidden sm:inline">{next.title}</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <div />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
