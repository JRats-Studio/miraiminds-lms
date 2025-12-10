'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { Lesson, Module } from '@/lib/api/payload-api'
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

const lessonSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  module: z.string().min(1, 'Module is required'),
  content: z.string().optional(),
  pdfUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  displayOrder: z.coerce.number().int().min(0, 'Order must be a positive number'),
})

type LessonFormValues = z.infer<typeof lessonSchema>

interface LessonFormProps {
  initialData?: Lesson
}

export function LessonForm({ initialData }: LessonFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  // Fetch modules for the select
  const { data: modulesData, loading: modulesLoading } = useCollection<Module>('modules', {
    limit: 100,
    depth: 1,
  })

  const getModuleId = () => {
    if (!initialData?.module) return ''
    if (typeof initialData.module === 'string') return initialData.module
    return String(initialData.module.id)
  }

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: initialData?.title || '',
      module: getModuleId(),
      content: '',
      pdfUrl: initialData?.pdfUrl || '',
      displayOrder: initialData?.displayOrder || 0,
    },
  })

  const onSubmit = async (values: LessonFormValues) => {
    try {
      // Convert module ID to number for Payload relationship
      const data = {
        ...values,
        module: parseInt(values.module, 10),
        pdfUrl: values.pdfUrl || undefined,
      }

      console.log('Submitting lesson:', data)

      if (isEditing) {
        await updateDocument<Lesson>('lessons', initialData.id, data)
        toast.success('Lesson updated successfully')
      } else {
        await createDocument<Lesson>('lessons', data)
        toast.success('Lesson created successfully')
      }
      router.push('/dashboard/admin/lessons')
      router.refresh()
    } catch (error) {
      toast.error(isEditing ? 'Failed to update lesson' : 'Failed to create lesson')
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Counting 1-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="module"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={modulesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={modulesLoading ? 'Loading modules...' : 'Select a module'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modulesData?.docs.map((module) => {
                        const subject = module.subject as { name: string } | undefined
                        return (
                          <SelectItem key={String(module.id)} value={String(module.id)}>
                            {module.name} {subject?.name ? `(${subject.name})` : ''}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>Which module this lesson belongs to.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Lesson content - text, instructions, explanations..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The main content of the lesson. Supports plain text.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pdfUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PDF URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://drive.google.com/file/d/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Google Drive link to the PDF worksheet.</FormDescription>
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
                    Order in which this lesson appears within its module.
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
                    ? 'Update Lesson'
                    : 'Create Lesson'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/admin/lessons')}
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
