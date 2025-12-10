import type { CollectionConfig } from 'payload'

const Modules: CollectionConfig = {
  slug: 'modules',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'subject', 'displayOrder'],
  },
  access: {
    // Students only see modules they have access to
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true

      // If no user or no user ID, deny access
      if (!user?.id) return false

      // Filter by allowedUsers array
      return {
        allowedUsers: {
          contains: user.id,
        },
      }
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Module name (e.g., "Numbers and Counting")',
      },
    },
    {
      name: 'subject',
      type: 'relationship',
      relationTo: 'subjects',
      required: true,
      admin: {
        description: 'Which subject this module belongs to',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Detailed description of the module content',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        description: 'Google Drive link to the video (paste full URL)',
        placeholder: 'https://drive.google.com/file/d/1abc...xyz/view',
      },
    },
    {
      name: 'allowedUsers',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      filterOptions: {
        role: {
          equals: 'student',
        },
      },
      admin: {
        description: 'Select which students can access this module',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Order in which modules appear within a subject',
      },
    },
  ],
}

export default Modules
