const prisma = require('../../config/db')
const { validateComplaint } = require('../../utils/validators')
const { routeComplaint } = require('../routing/routing.service')
const { createNotification } = require('../../services/notificationService')

const createComplaint = async (req, res) => {
  try {
    const errors = validateComplaint(req.body)
    if (errors.length > 0) return res.status(400).json({ errors })

    const { title, description, category, location, priority } = req.body
    const routing = routeComplaint(category, description)

    let department = null
    if (routing.department) {
      department = await prisma.department.findFirst({
        where: { name: { contains: routing.department, mode: 'insensitive' } },
      })
    }

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category,
        location,
        priority: priority || routing.priority,
        createdById: req.user.id,
        departmentId: department?.id || null,
        dueAt: routing.dueAt,
      },
      include: { department: true, createdBy: { select: { name: true, email: true } } },
    })

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        complaintId: complaint.id,
        action: 'CREATED',
        newValue: 'SUBMITTED',
      },
    })

    await createNotification({
      userId: req.user.id,
      complaintId: complaint.id,
      type: 'COMPLAINT_CREATED',
      message: `Your complaint "${title}" has been submitted successfully.`,
    })

    res.status(201).json({ message: 'Complaint created', complaint })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getMyComplaints = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: { createdById: req.user.id },
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ complaints })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getAllComplaints = async (req, res) => {
  try {
    const { status, priority, category, departmentId, page = 1, limit = 10 } = req.query
    const where = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (category) where.category = category
    if (departmentId) where.departmentId = departmentId
    if (req.user.role.name === 'STAFF') where.departmentId = req.user.departmentId

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: { department: true, createdBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.complaint.count({ where }),
    ])

    res.json({ complaints, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getComplaintById = async (req, res) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: {
        department: true,
        createdBy: { select: { name: true, email: true } },
        comments: { include: { user: { select: { name: true, role: true } } } },
        attachments: true,
        auditLogs: { include: { actor: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
        assignments: { include: { assignee: { select: { name: true } } } },
      },
    })
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })
    res.json({ complaint })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } })
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

    const transition = await prisma.workflowTransition.findFirst({
      where: { fromStatus: complaint.status, toStatus: status, allowedRole: req.user.role.name },
    })
    if (!transition) {
      return res.status(403).json({ message: `Transition from ${complaint.status} to ${status} not allowed` })
    }

    const updated = await prisma.complaint.update({
      where: { id: req.params.id },
      data: { status },
    })

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        complaintId: complaint.id,
        action: 'STATUS_CHANGED',
        oldValue: complaint.status,
        newValue: status,
      },
    })

    await createNotification({
      userId: complaint.createdById,
      complaintId: complaint.id,
      type: 'STATUS_UPDATED',
      message: `Your complaint status changed to ${status}.`,
    })

    if (global.io) {
      global.io.to(`user_${complaint.createdById}`).emit('statusUpdate', {
        complaintId: complaint.id,
        status,
      })
    }

    res.json({ message: 'Status updated', complaint: updated })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const addComment = async (req, res) => {
  try {
    const { comment } = req.body
    if (!comment) return res.status(400).json({ message: 'Comment is required' })

    const newComment = await prisma.comment.create({
      data: { complaintId: req.params.id, userId: req.user.id, comment },
      include: { user: { select: { name: true } } },
    })

    res.status(201).json({ message: 'Comment added', comment: newComment })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const assignComplaint = async (req, res) => {
  try {
    const { assignedTo } = req.body
    if (!assignedTo) return res.status(400).json({ message: 'assignedTo is required' })

    const assignment = await prisma.assignment.create({
      data: { complaintId: req.params.id, assignedTo, assignedBy: req.user.id },
    })

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        complaintId: req.params.id,
        action: 'ASSIGNED',
        newValue: assignedTo,
      },
    })

    res.status(201).json({ message: 'Complaint assigned', assignment })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createComplaint, getMyComplaints, getAllComplaints, getComplaintById, updateStatus, addComment, assignComplaint }