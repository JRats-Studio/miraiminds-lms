'use client'

import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { Subject, Grade } from '@/lib/api/payload-api'
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

const subjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  grade: z.string().min(1, 'Grade is required'),
  description: z.string().optional(),
  displayOrder: z.coerce.number().int().min(0, 'Order must be a positive number'),
})

type SubjectFormValues = {
  name: string
  grade: string
  description?: string
  displayOrder: number
}

interface SubjectFormProps {
  initialData?: Subject
}

export function SubjectForm({ initialData }: SubjectFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  // Fetch grades for the select
  const { data: gradesData, loading: gradesLoading } = useCollection<Grade>('grades', {
    limit: 100,
    sort: 'displayOrder',
  })

  const getGradeId = () => {
    if (!initialData?.grade) return ''
    if (typeof initialData.grade === 'string') return initialData.grade
    return String(initialData.grade.id)
  }

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema) as Resolver<SubjectFormValues>,
    defaultValues: {
      name: initialData?.name || '',
      grade: getGradeId(),
      description: initialData?.description || '',
      displayOrder: initialData?.displayOrder || 0,
    },
  })

  const onSubmit = async (values: SubjectFormValues) => {
    try {
      // Convert grade ID to number for Payload relationship
      const data = {
        ...values,
        grade: parseInt(values.grade, 10),
      }

      if (isEditing) {
        await updateDocument<Subject>('subjects', initialData.id, data as unknown as Partial<Subject>)
        toast.success('Subject updated successfully')
      } else {
        await createDocument<Subject>('subjects', data as unknown as Partial<Subject>)
        toast.success('Subject created successfully')
      }
      router.push('/dashboard/admin/subjects')
      router.refresh()
    } catch (error) {
      toast.error(isEditing ? 'Failed to update subject' : 'Failed to create subject')
      console.error(error)
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
                    <Input placeholder="e.g., Mathematics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={gradesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={gradesLoading ? 'Loading grades...' : 'Select a grade'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {gradesData?.docs.map((grade) => (
                        <SelectItem key={String(grade.id)} value={String(grade.id)}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Which grade this subject belongs to.</FormDescription>
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
                    <Textarea placeholder="Brief description of this subject..." {...field} />
                  </FormControl>
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
                    Order in which this subject appears within its grade.
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
                    ? 'Update Subject'
                    : 'Create Subject'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/admin/subjects')}
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
