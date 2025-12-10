import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function StudentDashboardPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <header className="space-y-2">
          <p className="text-sm text-muted-foreground">Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Mirai Minds</h1>
          <p className="text-muted-foreground">
            Student dashboard is connected; content cards will appear here once grades and subjects are
            available.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Grades</CardTitle>
              <CardDescription>Browse by grade level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin panel</CardTitle>
              <CardDescription>Switch to admin dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/admin" className="text-primary hover:underline">
                Go to admin dashboard
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

