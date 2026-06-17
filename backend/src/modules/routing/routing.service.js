const ROUTING_RULES = [
  {
    department: 'IT',
    keywords: ['wifi', 'internet', 'network', 'server', 'computer', 'laptop', 'software', 'login', 'password', 'email', 'printer'],
    priority: 'MEDIUM',
  },
  {
    department: 'Electrical',
    keywords: ['light', 'electricity', 'wire', 'wiring', 'power', 'electric', 'fan', 'socket', 'switch', 'voltage', 'shock', 'sparking'],
    priority: 'HIGH',
  },
  {
    department: 'Sanitation',
    keywords: ['garbage', 'waste', 'trash', 'clean', 'cleaning', 'sweep', 'dustbin', 'toilet', 'washroom', 'smell', 'dirty', 'hygiene'],
    priority: 'MEDIUM',
  },
  {
    department: 'Maintenance',
    keywords: ['water', 'pipe', 'leak', 'leakage', 'tap', 'drain', 'plumbing', 'chair', 'table', 'furniture', 'broken', 'repair', 'door', 'window', 'lock'],
    priority: 'MEDIUM',
  },
  {
    department: 'Hostel',
    keywords: ['hostel room', 'roommate', 'warden', 'mess food', 'canteen'],
    priority: 'MEDIUM',
  },
  {
    department: 'Administration',
    keywords: ['fee', 'admin', 'certificate', 'document', 'id card', 'registration', 'library', 'liberary', 'seating', 'seats'],
    priority: 'LOW',
  },
]

const EMERGENCY_KEYWORDS = ['fire', 'accident', 'emergency', 'unsafe', 'danger', 'exposed wire', 'snake', 'venomous', 'collapse', 'gas leak']

const SLA_HOURS = { CRITICAL: 6, HIGH: 24, MEDIUM: 72, LOW: 168 }

const scoreDepartment = (text, rule) => {
  let score = 0
  const matched = []
  for (const keyword of rule.keywords) {
    if (text.includes(keyword)) {
      score += keyword.length
      matched.push(keyword)
    }
  }
  return { score, matched }
}

const routeComplaint = (description) => {
  const text = description.toLowerCase()

  const isEmergency = EMERGENCY_KEYWORDS.some((k) => text.includes(k))

  let bestMatch = null
  for (const rule of ROUTING_RULES) {
    const { score, matched } = scoreDepartment(text, rule)
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { department: rule.department, priority: rule.priority, score, matched }
    }
  }

  const department = bestMatch ? bestMatch.department : 'Administration'
  const matchedKeywords = bestMatch ? bestMatch.matched : []
  const confidence = bestMatch ? Math.min(bestMatch.score / 20, 1) : 0

  let priority = bestMatch ? bestMatch.priority : 'LOW'
  if (isEmergency) priority = 'CRITICAL'

  const dueAt = new Date()
  dueAt.setHours(dueAt.getHours() + SLA_HOURS[priority])

  const reasoning = isEmergency
    ? 'Flagged as emergency due to urgent keywords'
    : bestMatch
    ? `Routed based on keywords: ${matchedKeywords.join(', ')}`
    : 'No strong keyword match - defaulted to Administration for manual triage'

  return { department, priority, dueAt, confidence: Math.round(confidence * 100), reasoning }
}

module.exports = { routeComplaint }
