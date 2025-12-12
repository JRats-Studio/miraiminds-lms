import type { CollectionConfig } from 'payload'

const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'module', 'displayOrder'],
  },
  access: {
    // Lessons inherit access from their parent module
    read: async ({ req: { user, payload } }) => {
      if (user?.role === 'admin') return true

      // If no user or no user ID, deny access
      if (!user?.id) return false

      // Get modules user has access to
      const accessibleModules = await payload.find({
        collection: 'modules',
        where: {
          allowedUsers: {
            contains: user.id,
          },
        },
        limit: 1000,
      })

      const moduleIds = accessibleModules.docs.map((m) => m.id)

      // If no accessible modules, deny access
      if (moduleIds.length === 0) return false

      return {
        module: {
          in: moduleIds,
        },
      }
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Lesson title (e.g., "Counting 1-10")',
      },
    },
    {
      name: 'module',
      type: 'relationship',
      relationTo: 'modules',
      required: true,
      admin: {
        description: 'Which module this lesson belongs to',
      },
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        description: 'Lesson content - text, instructions, explanations',
      },
    },
    {
      name: 'coverImageUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Google Drive link to the cover image (JPG)',
        placeholder: 'https://drive.google.com/file/d/xxx/view',
      },
    },
    {
      name: 'contentPdfUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Google Drive link to the main lesson content PDF',
        placeholder: 'https://drive.google.com/file/d/xxx/view',
      },
    },
    {
      name: 'activityPdfUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Google Drive link to the student activity PDF',
        placeholder: 'https://drive.google.com/file/d/xxx/view',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Order in which lessons appear within a module',
      },
    },
  ],
}

export default Lessons
