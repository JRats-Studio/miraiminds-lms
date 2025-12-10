import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface ContentCardProps {
  title: string
  description?: string
  href: string
  icon?: React.ReactNode
}

export default function ContentCard({ title, description, href, icon }: ContentCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-lg hover:border-secondary transition-all duration-200 hover:-translate-y-1 h-full">
        <CardHeader>
          {icon && (
            <div className="mb-2 text-secondary">
              {icon}
            </div>
          )}
          <CardTitle
            className="text-secondary"
            style={{ fontFamily: 'var(--font-header)' }}
          >
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="line-clamp-3">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  )
}
