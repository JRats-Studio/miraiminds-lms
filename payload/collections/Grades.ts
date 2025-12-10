import type { CollectionConfig } from 'payload'

const Grades: CollectionConfig = {
  slug: 'grades',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'displayOrder'],
  },
  access: {
    read: () => true, // Everyone can read
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
        description: 'E.g., "Grade 1", "Grade 2"',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief description of this grade level',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Order in which grades appear (lower numbers first)',
      },
    },
  ],
}

export default Grades
