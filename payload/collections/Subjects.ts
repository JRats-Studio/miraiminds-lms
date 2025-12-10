import type { CollectionConfig } from 'payload'

const Subjects: CollectionConfig = {
  slug: 'subjects',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'grade', 'displayOrder'],
  },
  access: {
    read: () => true,
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
        description: 'E.g., "Mathematics", "Science", "English"',
      },
    },
    {
      name: 'grade',
      type: 'relationship',
      relationTo: 'grades',
      required: true,
      admin: {
        description: 'Which grade this subject belongs to',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief description of this subject',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Order in which subjects appear within a grade',
      },
    },
  ],
}

export default Subjects
