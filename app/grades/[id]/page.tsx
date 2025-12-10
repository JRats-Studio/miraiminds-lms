import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import type { Grade, Subject } from '@/lib/api/payload-api'
import Breadcrumbs from '@/components/Breadcrumbs'
import ContentCard from '@/components/ContentCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

async function fetchGrade(id: string) {
  const res = await fetch(`${serverUrl}/api/grades/${id}`, {
    headers: { cookie: cookies().toString() },
    cache: 'no-store',
  })

  if (res.status === 401) redirect('/login')
  if (res.status === 404) notFound()
  if (!res.ok) throw new Error('Failed to load grade')

  return res.json() as Promise<Grade>
}

async function fetchSubjects(gradeId: string) {
  const params = new URLSearchParams()
  params.set('sort', 'displayOrder')
  params.set(
    'where',
    JSON.stringify({
      grade: { equals: gradeId },
    })
  )

  const res = await fetch(`${serverUrl}/api/subjects?${params.toString()}`, {
    headers: { cookie: cookies().toString() },
    cache: 'no-store',
  })

  if (res.status === 401) redirect('/login')
  if (!res.ok) throw new Error('Failed to load subjects')

  return res.json() as Promise<{ docs: Subject[] }>
}

async function SubjectsGrid({ gradeId }: { gradeId: string }) {
  const data = await fetchSubjects(gradeId)
  const subjects = data.docs || []

  if (!subjects.length) {
    return (
      <div className="rounded-lg border border-dashed bg-card/50 p-6 text-center text-muted-foreground">
        No subjects are available for this grade yet.
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((subject) => (
        <ContentCard
          key={subject.id}
          title={subject.name}
          description={subject.description}
          href={`/subjects/${subject.id}`}
        />
      ))}
    </div>
  )
}

export default async function GradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const grade = await fetchGrade(id)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <Breadcrumbs items={[{ label: grade.name }]} />

      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Grade</p>
        <h1 className="text-3xl font-bold">{grade.name}</h1>
        {grade.description && <p className="text-muted-foreground">{grade.description}</p>}
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Subjects</h2>
        <Suspense fallback={<LoadingSkeleton variant="card-grid" />}>
          <SubjectsGrid gradeId={grade.id} />
        </Suspense>
      </section>
    </div>
  )
}

