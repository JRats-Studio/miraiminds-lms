import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Grade, Lesson, Module, Subject } from '@/lib/api/payload-api'
import Breadcrumbs from '@/components/Breadcrumbs'
import DriveVideoPlayer from '@/components/DriveVideoPlayer'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

interface ModuleWithSubject extends Module {
  subject: Subject | string
}

async function fetchModule(id: string) {
  const cookieStore = await cookies()
  const res = await fetch(`${serverUrl}/api/modules/${id}?depth=2`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  })

  if (res.status === 401) redirect('/login')
  if (res.status === 404) notFound()
  if (res.status === 403) redirect('/dashboard')
  if (!res.ok) throw new Error('Failed to load module')

  return res.json() as Promise<ModuleWithSubject>
}

async function fetchLessons(moduleId: string) {
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
  if (!content) return undefined
  if (typeof content === 'string') return content
  return undefined
}

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const moduleRecord = await fetchModule(id)
  const lessonsData = await fetchLessons(moduleRecord.id)
  const lessons = lessonsData.docs || []

  const subject = moduleRecord.subject as Subject
  const grade = (subject?.grade || null) as Grade | string | null

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <Breadcrumbs
        items={[
          grade && typeof grade !== 'string'
            ? { label: grade.name, href: `/grades/${grade.id}` }
            : { label: 'Grade' },
          subject
            ? { label: subject.name, href: `/subjects/${subject.id}` }
            : { label: 'Subject' },
          { label: moduleRecord.name },
        ]}
      />

      <header className="space-y-3">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Module</p>
        <h1 className="text-3xl font-bold">{moduleRecord.name}</h1>
        {toPlainText(moduleRecord.description) && (
          <p className="text-muted-foreground">{toPlainText(moduleRecord.description)}</p>
        )}
      </header>

      {moduleRecord.videoUrl && (
        <DriveVideoPlayer
          url={moduleRecord.videoUrl}
          title={moduleRecord.name}
        />
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Lessons</h2>
          <span className="text-sm text-muted-foreground">{lessons.length} lessons</span>
        </div>

        {!lessons.length ? (
          <div className="rounded-lg border border-dashed bg-card/50 p-6 text-center text-muted-foreground">
            Lessons will appear here once added.
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="hover:border-secondary transition-all">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link href={`/lessons/${lesson.id}`} className="hover:underline">
                      {lesson.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>Order {lesson.displayOrder}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator />

      <div className="text-sm text-muted-foreground">
        Need a different module?{' '}
        <Link href={`/subjects/${subject?.id ?? ''}`} className="text-primary hover:underline">
          Back to subject
        </Link>
      </div>
    </div>
  )
}

