'use client'

import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { Grade } from '@/lib/api/payload-api'
import { createDocument, updateDocument } from '@/lib/api/payload-api'
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
import { Card, CardContent } from '@/components/ui/card'

const gradeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  displayOrder: z.coerce.number().int().min(0, 'Order must be a positive number'),
})

type GradeFormValues = {
  name: string
  description?: string
  displayOrder: number
}

interface GradeFormProps {
  initialData?: Grade
}

export function GradeForm({ initialData }: GradeFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema) as Resolver<GradeFormValues>,
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      displayOrder: initialData?.displayOrder || 0,
    },
  })

  const onSubmit = async (values: GradeFormValues) => {
    try {
      if (isEditing) {
        await updateDocument<Grade>('grades', initialData.id, values)
        toast.success('Grade updated successfully')
      } else {
        await createDocument<Grade>('grades', values)
        toast.success('Grade created successfully')
      }
      router.push('/dashboard/admin/grades')
      router.refresh()
    } catch (error) {
      toast.error(isEditing ? 'Failed to update grade' : 'Failed to create grade')
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
                    <Input placeholder="e.g., Grade 1" {...field} />
                  </FormControl>
                  <FormDescription>The name of the grade level.</FormDescription>
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
                      placeholder="Brief description of this grade level..."
                      {...field}
                    />
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
                    Order in which this grade appears. Lower numbers appear first.
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
                    ? 'Update Grade'
                    : 'Create Grade'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/admin/grades')}
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
