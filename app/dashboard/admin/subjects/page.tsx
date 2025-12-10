'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import type { Subject, Grade } from '@/lib/api/payload-api'
import { useCollection } from '@/hooks/use-collection'
import { DataTable } from '@/components/admin/data-table/data-table'
import { RowActions } from '@/components/admin/data-table/row-actions'
import { DeleteDialog } from '@/components/admin/delete-dialog'
import { Badge } from '@/components/ui/badge'

export default function SubjectsPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { data, loading, params, setParams, remove } = useCollection<Subject>('subjects', {
    page: 1,
    limit: 10,
    sort: 'displayOrder',
    depth: 1, // Include grade relationship
  })

  const columns: ColumnDef<Subject>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: 'grade',
        header: 'Grade',
        cell: ({ row }) => {
          const grade = row.original.grade as Grade
          return grade?.name ? (
            <Badge variant="secondary">{grade.name}</Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className="text-muted-foreground truncate max-w-xs block">
            {row.original.description || '-'}
          </span>
        ),
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
            onEdit={() => router.push(`/dashboard/admin/subjects/${row.original.id}/edit`)}
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
      toast.success('Subject deleted successfully')
    } catch (error) {
      toast.error('Failed to delete subject')
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
    return data.docs.filter(
      (subject) =>
        subject.name.toLowerCase().includes(search) ||
        subject.description?.toLowerCase().includes(search)
    )
  }, [data?.docs, searchValue])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
          Subjects
        </h1>
        <p className="text-muted-foreground">Manage subjects for each grade level.</p>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        searchPlaceholder="Search subjects..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onCreateNew={() => router.push('/dashboard/admin/subjects/new/edit')}
        createNewLabel="Add Subject"
        page={params.page || 1}
        pageCount={data?.totalPages || 1}
        totalDocs={data?.totalDocs || 0}
        onPageChange={(page) => setParams({ ...params, page })}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Subject"
        description="Are you sure you want to delete this subject? This will also delete all associated modules and lessons."
        loading={deleteLoading}
      />
    </div>
  )
}
