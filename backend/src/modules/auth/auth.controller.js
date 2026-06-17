const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../../config/db')
const { validateRegister } = require('../../utils/validators')

const register = async (req, res) => {
  try {
    const errors = validateRegister(req.body)
    if (errors.length > 0) return res.status(400).json({ errors })

    const { name, email, password, role, departmentId } = req.body

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const requestedRole = role === 'STAFF' ? 'STAFF' : 'CITIZEN'

    if (requestedRole === 'STAFF' && !departmentId) {
      return res.status(400).json({ message: 'Department is required for staff registration' })
    }

    const roleRecord = await prisma.role.findUnique({ where: { name: requestedRole } })
    if (!roleRecord) return res.status(500).json({ message: 'Roles not seeded. Run seed first.' })

    if (requestedRole === 'STAFF') {
      const dept = await prisma.department.findUnique({ where: { id: departmentId } })
      if (!dept) return res.status(400).json({ message: 'Invalid department' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roleId: roleRecord.id,
        departmentId: requestedRole === 'STAFF' ? departmentId : null,
        status: requestedRole === 'STAFF' ? 'PENDING' : 'ACTIVE',
      },
      include: { role: true, department: true },
    })

    if (requestedRole === 'STAFF') {
      return res.status(201).json({
        message: 'Registration submitted. Your staff account is pending admin approval before you can log in.',
        user: { id: user.id, name: user.name, email: user.email, role: user.role.name, status: user.status },
      })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    res.status(201).json({
      message: 'Registered successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role.name },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true, department: true },
    })

    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

    if (user.status === 'PENDING') {
      return res.status(403).json({ message: 'Your account is pending admin approval. Please wait for confirmation.' })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        department: user.department?.name || null,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role.name,
      department: req.user.department?.name || null,
    },
  })
}

const getPendingStaff = async (req, res) => {
  try {
    const pending = await prisma.user.findMany({
      where: { status: 'PENDING' },
      include: { role: true, department: true },
      orderBy: { createdAt: 'asc' },
    })
    res.json({ pending })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const approveStaff = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (user.status !== 'PENDING') return res.status(400).json({ message: 'User is not pending approval' })

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'ACTIVE' },
      include: { role: true, department: true },
    })

    res.json({ message: 'Staff account approved', user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role.name, department: updated.department?.name } })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { register, login, getMe, getPendingStaff, approveStaff }
