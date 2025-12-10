import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { Users, Grades, Subjects, Modules, Lessons } from './payload/collections'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',
  admin: {
    user: 'users',
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  editor: lexicalEditor(),
  collections: [Users, Grades, Subjects, Modules, Lessons],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
