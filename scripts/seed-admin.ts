import { getPayload } from 'payload'
import config from '../payload.config'

async function seedAdmin() {
  const payload = await getPayload({ config })

  // Check if admin exists
  const admins = await payload.find({
    collection: 'users',
    where: {
      role: {
        equals: 'admin',
      },
    },
  })

  if (admins.docs.length > 0) {
    console.log('Admin already exists, skipping seed')
    process.exit(0)
  }

  // Create first admin
  await payload.create({
    collection: 'users',
    data: {
      email: process.env.ADMIN_EMAIL || 'admin@miraiminds.com',
      name: 'Admin User',
      password: process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!',
      role: 'admin',
    },
  })

  console.log('Admin user created successfully')
  process.exit(0)
}

seedAdmin().catch((err) => {
  console.error('Error seeding admin:', err)
  process.exit(1)
})
