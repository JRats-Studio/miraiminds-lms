'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import type { User } from '@/lib/api/payload-api'
import { useCollection } from '@/hooks/use-collection'
import { DataTable } from '@/components/admin/data-table/data-table'
import { RowActions } from '@/components/admin/data-table/row-actions'
import { DeleteDialog } from '@/components/admin/delete-dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function UsersPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { data, loading, params, setParams, remove } = useCollection<User>('users', {
    page: 1,
    limit: 10,
    depth: 0,
  })

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {row.original.name?.charAt(0) || row.original.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{row.original.name || 'Unnamed'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <Badge variant={row.original.role === 'admin' ? 'default' : 'secondary'}>
            {row.original.role}
          </Badge>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <RowActions
            onEdit={() => router.push(`/dashboard/admin/users/${row.original.id}/edit`)}
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
      toast.success('User deleted successfully')
    } catch {
      toast.error('Failed to delete user')
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
      (user) =>
        user.name?.toLowerCase().includes(search) || user.email.toLowerCase().includes(search)
    )
  }, [data?.docs, searchValue])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito)' }}>
          Users
        </h1>
        <p className="text-muted-foreground">Manage user accounts and permissions.</p>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        searchPlaceholder="Search users..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onCreateNew={() => router.push('/dashboard/admin/users/new/edit')}
        createNewLabel="Add User"
        page={params.page || 1}
        pageCount={data?.totalPages || 1}
        totalDocs={data?.totalDocs || 0}
        onPageChange={(page) => setParams({ ...params, page })}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  )
}
