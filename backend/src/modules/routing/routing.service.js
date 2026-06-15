const ROUTING_RULES = [
  { keywords: ['wifi', 'internet', 'network', 'server', 'computer', 'laptop', 'software'], department: 'IT', priority: 'MEDIUM' },
  { keywords: ['light', 'electricity', 'wire', 'power', 'electric', 'fan', 'socket'], department: 'Electrical', priority: 'HIGH' },
  { keywords: ['water', 'pipe', 'leak', 'tap', 'drain', 'plumbing'], department: 'Maintenance', priority: 'HIGH' },
  { keywords: ['hostel', 'room', 'bed', 'mess', 'food', 'canteen'], department: 'Hostel', priority: 'MEDIUM' },
  { keywords: ['road', 'garbage', 'waste', 'clean', 'sweep', 'dustbin'], department: 'Sanitation', priority: 'LOW' },
  { keywords: ['fee', 'admin', 'certificate', 'document', 'id card', 'registration'], department: 'Administration', priority: 'LOW' },
]

const SLA_HOURS = { CRITICAL: 6, HIGH: 24, MEDIUM: 72, LOW: 168 }

const routeComplaint = (category, description) => {
  const text = `${category} ${description}`.toLowerCase()
  let department = 'Administration'
  let priority = 'MEDIUM'

  if (text.includes('fire') || text.includes('accident') || text.includes('emergency')) {
    priority = 'CRITICAL'
  } else {
    for (const rule of ROUTING_RULES) {
      if (rule.keywords.some((k) => text.includes(k))) {
        department = rule.department
        priority = rule.priority
        break
      }
    }
  }

  const dueAt = new Date()
  dueAt.setHours(dueAt.getHours() + SLA_HOURS[priority])

  return { department, priority, dueAt }
}

module.exports = { routeComplaint }