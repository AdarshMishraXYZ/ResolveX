const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })
async function main() {
  console.log('Seeding roles...')
  const roles = ['CITIZEN', 'STAFF', 'DEPARTMENT_HEAD', 'ADMIN']
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log('Seeding departments...')
  const departments = ['IT', 'Maintenance', 'Hostel', 'Administration', 'Electrical', 'Sanitation']
  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log('Seeding skills...')
  const skills = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Technician', 'Mason', 'Cleaner', 'IT Technician', 'Gardener', 'Locksmith']
  for (const name of skills) {
    await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log('Seeding admin user...')
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } })
  const passwordHash = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@resolvex.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@resolvex.com',
      passwordHash,
      roleId: adminRole.id,
    },
  })

  console.log('Seeding workflow transitions...')
  const transitions = [
    { fromStatus: 'SUBMITTED', toStatus: 'UNDER_REVIEW', allowedRole: 'STAFF' },
    { fromStatus: 'UNDER_REVIEW', toStatus: 'ASSIGNED', allowedRole: 'DEPARTMENT_HEAD' },
    { fromStatus: 'UNDER_REVIEW', toStatus: 'REJECTED', allowedRole: 'DEPARTMENT_HEAD' },
    { fromStatus: 'ASSIGNED', toStatus: 'IN_PROGRESS', allowedRole: 'STAFF' },
    { fromStatus: 'IN_PROGRESS', toStatus: 'VERIFICATION', allowedRole: 'STAFF' },
    { fromStatus: 'IN_PROGRESS', toStatus: 'ESCALATED', allowedRole: 'DEPARTMENT_HEAD' },
    { fromStatus: 'VERIFICATION', toStatus: 'RESOLVED', allowedRole: 'DEPARTMENT_HEAD' },
    { fromStatus: 'VERIFICATION', toStatus: 'REOPENED', allowedRole: 'DEPARTMENT_HEAD' },
    { fromStatus: 'RESOLVED', toStatus: 'CLOSED', allowedRole: 'ADMIN' },
    { fromStatus: 'RESOLVED', toStatus: 'REOPENED', allowedRole: 'ADMIN' },
  ]
  for (const t of transitions) {
    await prisma.workflowTransition.create({ data: t })
  }

  console.log('✅ Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())