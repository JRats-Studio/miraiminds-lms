'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import type { Grade } from '@/lib/api/payload-api'
import { useCollection } from '@/hooks/use-collection'
import { DataTable } from '@/components/admin/data-table/data-table'
import { RowActions } from '@/components/admin/data-table/row-actions'
import { DeleteDialog } from '@/components/admin/delete-dialog'

export default function GradesPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { data, loading, params, setParams, remove } = useCollection<Grade>('grades', {
    page: 1,
    limit: 10,
    sort: 'displayOrder',
  })

  const columns: ColumnDef<Grade>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
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
            onEdit={() => router.push(`/dashboard/admin/grades/${row.original.id}/edit`)}
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
      toast.success('Grade deleted successfully')
    } catch {
      toast.error('Failed to delete grade')
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
      (grade) =>
        grade.name.toLowerCase().includes(search) ||
        grade.description?.toLowerCase().includes(search)
    )
  }, [data?.docs, searchValue])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
          Grades
        </h1>
        <p className="text-muted-foreground">Manage grade levels for the LMS.</p>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        searchPlaceholder="Search grades..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onCreateNew={() => router.push('/dashboard/admin/grades/new/edit')}
        createNewLabel="Add Grade"
        page={params.page || 1}
        pageCount={data?.totalPages || 1}
        totalDocs={data?.totalDocs || 0}
        onPageChange={(page) => setParams({ ...params, page })}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Grade"
        description="Are you sure you want to delete this grade? This will also delete all associated subjects, modules, and lessons."
        loading={deleteLoading}
      />
    </div>
  )
}
