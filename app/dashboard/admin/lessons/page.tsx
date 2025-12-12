'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import type { Lesson, Module } from '@/lib/api/payload-api'
import { useCollection } from '@/hooks/use-collection'
import { DataTable } from '@/components/admin/data-table/data-table'
import { RowActions } from '@/components/admin/data-table/row-actions'
import { DeleteDialog } from '@/components/admin/delete-dialog'
import { Badge } from '@/components/ui/badge'

export default function LessonsPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { data, loading, params, setParams, remove } = useCollection<Lesson>('lessons', {
    page: 1,
    limit: 10,
    sort: 'displayOrder',
    depth: 1, // Include module relationship
  })

  const columns: ColumnDef<Lesson>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
      },
      {
        accessorKey: 'module',
        header: 'Module',
        cell: ({ row }) => {
          const lessonModule = row.original.module as Module
          return lessonModule?.name ? (
            <Badge variant="secondary">{lessonModule.name}</Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )
        },
      },
      {
        id: 'media',
        header: 'Media',
        cell: ({ row }) => {
          const hasCover = !!row.original.coverImageUrl
          const hasContent = !!row.original.contentPdfUrl
          const hasActivity = !!row.original.activityPdfUrl
          return (
            <div className="flex gap-1">
              <Badge variant={hasCover ? 'default' : 'outline'} className="text-xs">
                Cover
              </Badge>
              <Badge variant={hasContent ? 'default' : 'outline'} className="text-xs">
                Content
              </Badge>
              <Badge variant={hasActivity ? 'default' : 'outline'} className="text-xs">
                Activity
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: 'displayOrder',
        header: 'Order',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.displayOrder}</span>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <RowActions
            onEdit={() => router.push(`/dashboard/admin/lessons/${row.original.id}/edit`)}
            onDelete={() => setDeleteId(row.original.id)}
          />
        ),
      },
    ],
    [router]
  )

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    try {
      await remove(deleteId)
      toast.success('Lesson deleted successfully')
    } catch {
      toast.error('Failed to delete lesson')
    } finally {
      setDeleteLoading(false)
      setDeleteId(null)
    }
  }

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!data?.docs) return []
    if (!searchValue) return data.docs

    const search = searchValue.toLowerCase()
    return data.docs.filter((lesson) => lesson.title.toLowerCase().includes(search))
  }, [data?.docs, searchValue])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
          Lessons
        </h1>
        <p className="text-muted-foreground">Manage lesson content within modules.</p>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        searchPlaceholder="Search lessons..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onCreateNew={() => router.push('/dashboard/admin/lessons/new/edit')}
        createNewLabel="Add Lesson"
        page={params.page || 1}
        pageCount={data?.totalPages || 1}
        totalDocs={data?.totalDocs || 0}
        onPageChange={(page) => setParams({ ...params, page })}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Lesson"
        description="Are you sure you want to delete this lesson?"
        loading={deleteLoading}
      />
    </div>
  )
}
