'use client'

import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import type { Module, Subject, User } from '@/lib/api/payload-api'
import { createDocument, updateDocument } from '@/lib/api/payload-api'
import { useCollection } from '@/hooks/use-collection'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

const moduleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  videoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  allowedUsers: z.array(z.string()).optional(),
  displayOrder: z.coerce.number().int().min(0, 'Order must be a positive number'),
})

type ModuleFormValues = {
  name: string
  subject: string
  description?: string
  videoUrl?: string
  allowedUsers?: string[]
  displayOrder: number
}

interface ModuleFormProps {
  initialData?: Module
}

export function ModuleForm({ initialData }: ModuleFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  // Fetch subjects for the select
  const { data: subjectsData, loading: subjectsLoading } = useCollection<Subject>('subjects', {
    limit: 100,
    depth: 1,
  })

  // Fetch users and filter to students only
  const { data: allUsersData, loading: usersLoading } = useCollection<User>('users', {
    limit: 100,
  })

  // Filter to only show students (not admins)
  const studentUsers = allUsersData?.docs.filter((user) => user.role === 'student') || []

  const getSubjectId = () => {
    if (!initialData?.subject) return ''
    if (typeof initialData.subject === 'string') return initialData.subject
    return String(initialData.subject.id)
  }

  const getAllowedUserIds = () => {
    if (!initialData?.allowedUsers) return []
    return initialData.allowedUsers.map((user) =>
      typeof user === 'string' ? user : String(user.id)
    )
  }

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema) as Resolver<ModuleFormValues>,
    defaultValues: {
      name: initialData?.name || '',
      subject: getSubjectId(),
      description: typeof initialData?.description === 'string' ? initialData.description : '',
      videoUrl: initialData?.videoUrl || '',
      allowedUsers: getAllowedUserIds(),
      displayOrder: initialData?.displayOrder || 0,
    },
  })

  // React Hook Form watch is fine here; suppress compiler warning.
  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedUsers = form.watch('allowedUsers') || []

  const onSubmit = async (values: ModuleFormValues) => {
    try {
      // Convert IDs to numbers for Payload relationships
      const data = {
        name: values.name,
        subject: parseInt(values.subject, 10),
        videoUrl: values.videoUrl || undefined,
        allowedUsers: values.allowedUsers?.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id)),
        description: values.description || undefined,
        displayOrder: values.displayOrder,
      }

      if (isEditing) {
        await updateDocument<Module>('modules', initialData.id, data as unknown as Partial<Module>)
        toast.success('Module updated successfully')
      } else {
        await createDocument<Module>('modules', data as unknown as Partial<Module>)
        toast.success('Module created successfully')
      }
      router.push('/dashboard/admin/modules')
      router.refresh()
    } catch (error) {
      toast.error(isEditing ? 'Failed to update module' : 'Failed to create module')
      console.error(error)
    }
  }

  const toggleUser = (userId: string) => {
    const current = form.getValues('allowedUsers') || []
    if (current.includes(userId)) {
      form.setValue(
        'allowedUsers',
        current.filter((id) => id !== userId)
      )
    } else {
      form.setValue('allowedUsers', [...current, userId])
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Numbers and Counting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={subjectsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={subjectsLoading ? 'Loading subjects...' : 'Select a subject'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjectsData?.docs.map((subject) => {
                        const grade = subject.grade as { name: string } | undefined
                        return (
                          <SelectItem key={String(subject.id)} value={String(subject.id)}>
                            {subject.name} {grade?.name ? `(${grade.name})` : ''}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>Which subject this module belongs to.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the module content..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://drive.google.com/file/d/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Google Drive link to the video.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowedUsers"
              render={() => (
                <FormItem>
                  <FormLabel>Allowed Students</FormLabel>
                  <FormDescription>
                    Select which students can access this module.
                  </FormDescription>
                  {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedUsers.map((userId) => {
                        const user = studentUsers.find((u) => String(u.id) === userId)
                        return (
                          <Badge key={userId} variant="secondary" className="gap-1">
                            {user?.name || user?.email || userId}
                            <button
                              type="button"
                              onClick={() => toggleUser(userId)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                  <div className="border rounded-md max-h-48 overflow-auto">
                    {usersLoading ? (
                      <p className="p-4 text-sm text-muted-foreground">Loading students...</p>
                    ) : studentUsers.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground">No students found</p>
                    ) : (
                      studentUsers.map((user) => (
                        <label
                          key={String(user.id)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-muted cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedUsers.includes(String(user.id))}
                            onCheckedChange={() => toggleUser(String(user.id))}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {user.name || 'Unnamed'}
                            </span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormDescription>
                    Order in which this module appears within its subject.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Saving...'
                  : isEditing
                    ? 'Update Module'
                    : 'Create Module'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/admin/modules')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
