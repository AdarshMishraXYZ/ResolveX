const prisma = require('../../config/db')

const getOverview = async (req, res) => {
  try {
    const [total, open, inProgress, resolved, closed, slaBreached] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: 'SUBMITTED' } }),
      prisma.complaint.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.complaint.count({ where: { status: 'RESOLVED' } }),
      prisma.complaint.count({ where: { status: 'CLOSED' } }),
      prisma.complaint.count({ where: { dueAt: { lt: new Date() }, status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
    ])

    const byDepartment = await prisma.complaint.groupBy({
      by: ['departmentId'],
      _count: { id: true },
    })

    const byCategory = await prisma.complaint.groupBy({
      by: ['category'],
      _count: { id: true },
    })

    res.json({ total, open, inProgress, resolved, closed, slaBreached, byDepartment, byCategory })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getOverview }