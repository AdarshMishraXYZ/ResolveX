const prisma = require('../../config/db')
const { validateComplaint } = require('../../utils/validators')
const { routeComplaint } = require('../routing/routing.service')
const { createNotification } = require('../../services/notificationService')

const createComplaint = async (req, res) => {
  try {
    const { title, description, location } = req.body

    if (!title || title.trim() === '') return res.status(400).json({ errors: ['Title is required'] })
    if (!description || description.trim() === '') return res.status(400).json({ errors: ['Description is required'] })

    const routing = routeComplaint(description)

    const department = await prisma.department.findFirst({
      where: { name: { contains: routing.department, mode: 'insensitive' } },
    })

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category: routing.department,
        location,
        priority: routing.priority,
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
        newValue: `SUBMITTED → routed to ${routing.department} (${routing.confidence}% confidence): ${routing.reasoning}`,
      },
    })

    await createNotification({
      userId: req.user.id,
      complaintId: complaint.id,
      type: 'COMPLAINT_CREATED',
      message: `Your complaint "${title}" was submitted and routed to ${routing.department}.`,
    })

    res.status(201).json({ message: 'Complaint created', complaint, routing })
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
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: { select: { name: true } }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        attachments: true,
        auditLogs: {
          include: { actor: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        },
        assignments: { include: { assignee: { select: { name: true } } } },
      },
    })

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

    const role = req.user.role.name
    const isOwner = complaint.createdById === req.user.id
    const isSameDepartment = complaint.departmentId === req.user.departmentId
    const isPrivileged = role === 'ADMIN' || role === 'DEPARTMENT_HEAD'

    if (role === 'CITIZEN' && !isOwner) {
      return res.status(403).json({ message: 'You can only view your own complaints' })
    }

    if (role === 'STAFF' && !isSameDepartment) {
      return res.status(403).json({ message: 'This complaint belongs to a different department' })
    }

    if (!isOwner && !isSameDepartment && !isPrivileged) {
      return res.status(403).json({ message: 'You do not have access to this complaint' })
    }

    res.json({ complaint })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


const updateStatus = async (req, res) => {
  try {
    const { status, version } = req.body

    if (version === undefined || version === null) {
      return res.status(400).json({ message: 'version is required to update status' })
    }

    const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } })
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

    const transition = await prisma.workflowTransition.findFirst({
      where: { fromStatus: complaint.status, toStatus: status, allowedRole: req.user.role.name },
    })
    if (!transition) {
      return res.status(403).json({ message: `Transition from ${complaint.status} to ${status} not allowed` })
    }

    const result = await prisma.complaint.updateMany({
      where: { id: req.params.id, version: parseInt(version) },
      data: { status, version: { increment: 1 } },
    })

    if (result.count === 0) {
      return res.status(409).json({
        message: 'This complaint was just updated by someone else. Please refresh and try again.',
      })
    }

    const updated = await prisma.complaint.findUnique({ where: { id: req.params.id } })

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
      message: `Your complaint "${complaint.title}" status changed to ${status.replace(/_/g, ' ')}.`,
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