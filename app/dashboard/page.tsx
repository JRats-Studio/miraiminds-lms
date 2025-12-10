import { Suspense } from 'react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Grade } from '@/lib/api/payload-api'
import ContentCard from '@/components/ContentCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

async function fetchGrades() {
  const cookieStore = await cookies()
  const res = await fetch(`${serverUrl}/api/grades?limit=100&sort=displayOrder`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to load grades')
  }

  return res.json() as Promise<{ docs: Grade[] }>
}

async function GradesSection() {
  const data = await fetchGrades()
  const grades = data.docs || []

  if (!grades.length) {
    return (
      <div className="rounded-lg border border-dashed bg-card/50 p-6 text-center text-muted-foreground">
        No grades available yet. Check back soon.
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {grades.map((grade) => (
        <ContentCard
          key={grade.id}
          title={grade.name}
          description={grade.description}
          href={`/grades/${grade.id}`}
        />
      ))}
    </div>
  )
}

export default function StudentDashboardPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <header className="space-y-2">
          <p className="text-sm text-muted-foreground">Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Mirai Minds LMS</h1>
          <p className="text-muted-foreground">
            Select your grade to explore subjects and modules assigned to you.
          </p>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Grades</h2>
            <Link href="/dashboard/admin" className="text-sm text-primary hover:underline">
              Go to admin dashboard
            </Link>
          </div>

          <Suspense fallback={<LoadingSkeleton variant="card-grid" />}>
            <GradesSection />
          </Suspense>
        </section>
      </div>
    </div>
  )
}

