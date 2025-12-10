import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

interface LoadingSkeletonProps {
  variant?: 'card' | 'page' | 'card-grid'
  count?: number
}

/**
 * Card skeleton for loading states
 */
function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-8" /> {/* Icon placeholder */}
        <Skeleton className="h-6 w-[200px]" /> {/* Title */}
        <Skeleton className="h-4 w-[280px]" /> {/* Description line 1 */}
        <Skeleton className="h-4 w-[240px]" /> {/* Description line 2 */}
      </CardHeader>
    </Card>
  )
}

/**
 * Page skeleton for full page loading states
 */
function PageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Title skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-5 w-[400px]" />
      </div>

      {/* Content skeleton - grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

/**
 * Grid of card skeletons
 */
function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export default function LoadingSkeleton({ variant = 'card', count = 6 }: LoadingSkeletonProps) {
  switch (variant) {
    case 'page':
      return <PageSkeleton />
    case 'card-grid':
      return <CardGridSkeleton count={count} />
    case 'card':
    default:
      return <CardSkeleton />
  }
}

// Export individual components for more flexibility
export { CardSkeleton, PageSkeleton, CardGridSkeleton }
