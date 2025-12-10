'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import type { Module, Subject, User } from '@/lib/api/payload-api'
import { useCollection } from '@/hooks/use-collection'
import { DataTable } from '@/components/admin/data-table/data-table'
import { RowActions } from '@/components/admin/data-table/row-actions'
import { DeleteDialog } from '@/components/admin/delete-dialog'
import { Badge } from '@/components/ui/badge'

export default function ModulesPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { data, loading, params, setParams, remove } = useCollection<Module>('modules', {
    page: 1,
    limit: 10,
    sort: 'displayOrder',
    depth: 1, // Include subject relationship
  })

  const columns: ColumnDef<Module>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: 'subject',
        header: 'Subject',
        cell: ({ row }) => {
          const subject = row.original.subject as Subject
          return subject?.name ? (
            <Badge variant="secondary">{subject.name}</Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )
        },
      },
      {
        accessorKey: 'allowedUsers',
        header: 'Students',
        cell: ({ row }) => {
          const users = row.original.allowedUsers as User[] | undefined
          const count = users?.length || 0
          return (
            <span className="text-muted-foreground">
              {count} {count === 1 ? 'student' : 'students'}
            </span>
          )
        },
      },
      {
        accessorKey: 'videoUrl',
        header: 'Video',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.videoUrl ? 'Yes' : 'No'}</span>
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
            onEdit={() => router.push(`/dashboard/admin/modules/${row.original.id}/edit`)}
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
      toast.success('Module deleted successfully')
    } catch {
      toast.error('Failed to delete module')
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
    return data.docs.filter((module) => module.name.toLowerCase().includes(search))
  }, [data?.docs, searchValue])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
          Modules
        </h1>
        <p className="text-muted-foreground">Manage learning modules and student access.</p>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        searchPlaceholder="Search modules..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onCreateNew={() => router.push('/dashboard/admin/modules/new/edit')}
        createNewLabel="Add Module"
        page={params.page || 1}
        pageCount={data?.totalPages || 1}
        totalDocs={data?.totalDocs || 0}
        onPageChange={(page) => setParams({ ...params, page })}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Module"
        description="Are you sure you want to delete this module? This will also delete all associated lessons."
        loading={deleteLoading}
      />
    </div>
  )
}
