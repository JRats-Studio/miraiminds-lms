import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import type { Grade, Module, Subject } from '@/lib/api/payload-api'
import Breadcrumbs from '@/components/Breadcrumbs'
import ContentCard from '@/components/ContentCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

interface SubjectWithGrade extends Subject {
  grade: Grade | string
}

async function fetchSubject(id: string) {
  const res = await fetch(`${serverUrl}/api/subjects/${id}?depth=1`, {
    headers: { cookie: cookies().toString() },
    cache: 'no-store',
  })

  if (res.status === 401) redirect('/login')
  if (res.status === 404) notFound()
  if (!res.ok) throw new Error('Failed to load subject')

  return res.json() as Promise<SubjectWithGrade>
}

async function fetchModules(subjectId: string) {
  const params = new URLSearchParams()
  params.set('sort', 'displayOrder')
  params.set('depth', '1')
  params.set(
    'where',
    JSON.stringify({
      subject: { equals: subjectId },
    })
  )

  const res = await fetch(`${serverUrl}/api/modules?${params.toString()}`, {
    headers: { cookie: cookies().toString() },
    cache: 'no-store',
  })

  if (res.status === 401) redirect('/login')
  if (!res.ok) throw new Error('Failed to load modules')

  return res.json() as Promise<{ docs: Module[] }>
}

async function ModulesGrid({ subjectId }: { subjectId: string }) {
  const data = await fetchModules(subjectId)
  const modules = data.docs || []

  if (!modules.length) {
    return (
      <div className="rounded-lg border border-dashed bg-card/50 p-6 text-center text-muted-foreground">
        No modules assigned yet for this subject.
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((module) => (
        <ContentCard
          key={module.id}
          title={module.name}
          description={typeof module.description === 'string' ? module.description : undefined}
          href={`/modules/${module.id}`}
        />
      ))}
    </div>
  )
}

export default async function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const subject = await fetchSubject(id)
  const grade = subject.grade as Grade

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <Breadcrumbs
        items={[
          { label: grade?.name || 'Grade', href: grade?.id ? `/grades/${grade.id}` : undefined },
          { label: subject.name },
        ]}
      />

      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Subject</p>
        <h1 className="text-3xl font-bold">{subject.name}</h1>
        {subject.description && <p className="text-muted-foreground">{subject.description}</p>}
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Modules</h2>
        <Suspense fallback={<LoadingSkeleton variant="card-grid" />}>
          <ModulesGrid subjectId={subject.id} />
        </Suspense>
      </section>
    </div>
  )
}

