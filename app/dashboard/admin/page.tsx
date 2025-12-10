import { getPayload } from 'payload'
import config from '@payload-config'
import { Users, GraduationCap, BookOpen, Layers, FileText } from 'lucide-react'
import { StatsCard } from '@/components/admin/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

async function getStats() {
  const payload = await getPayload({ config })

  const [users, grades, subjects, modules, lessons] = await Promise.all([
    payload.count({ collection: 'users' }),
    payload.count({ collection: 'grades' }),
    payload.count({ collection: 'subjects' }),
    payload.count({ collection: 'modules' }),
    payload.count({ collection: 'lessons' }),
  ])

  // Get recent lessons for activity feed
  const recentLessons = await payload.find({
    collection: 'lessons',
    limit: 5,
    sort: '-createdAt',
    depth: 1,
  })

  // Get recent users
  const recentUsers = await payload.find({
    collection: 'users',
    limit: 5,
    sort: '-createdAt',
  })

  return {
    counts: {
      users: users.totalDocs,
      grades: grades.totalDocs,
      subjects: subjects.totalDocs,
      modules: modules.totalDocs,
      lessons: lessons.totalDocs,
    },
    recentLessons: recentLessons.docs,
    recentUsers: recentUsers.docs,
  }
}

export default async function AdminDashboardPage() {
  const { counts, recentLessons, recentUsers } = await getStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">Welcome to the Mirai Minds LMS admin dashboard.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Link href="/dashboard/admin/users">
          <StatsCard
            title="Total Users"
            value={counts.users}
            icon={Users}
            description="Active accounts"
          />
        </Link>
        <Link href="/dashboard/admin/grades">
          <StatsCard
            title="Grades"
            value={counts.grades}
            icon={GraduationCap}
            description="Grade levels"
          />
        </Link>
        <Link href="/dashboard/admin/subjects">
          <StatsCard
            title="Subjects"
            value={counts.subjects}
            icon={BookOpen}
            description="Across all grades"
          />
        </Link>
        <Link href="/dashboard/admin/modules">
          <StatsCard
            title="Modules"
            value={counts.modules}
            icon={Layers}
            description="Learning modules"
          />
        </Link>
        <Link href="/dashboard/admin/lessons">
          <StatsCard
            title="Lessons"
            value={counts.lessons}
            icon={FileText}
            description="Total content"
          />
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Lessons</CardTitle>
            <CardDescription>Latest lessons added to the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLessons.length > 0 ? (
              <ul className="space-y-2">
                {recentLessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                  >
                    <span className="font-medium truncate">{lesson.title}</span>
                    <span className="text-sm text-muted-foreground">
                      Order: {lesson.displayOrder}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">No lessons yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest users registered</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers.length > 0 ? (
              <ul className="space-y-2">
                {recentUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium truncate">{user.name || 'Unnamed'}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    <span className="text-sm text-muted-foreground capitalize">{user.role}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">No users yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
