const express = require('express')
const { register, login, getMe, getPendingStaff, approveStaff, impersonateUser, getAllUsers } = require('./auth.controller')
const { requireAuth } = require('../../middleware/authMiddleware')
const { requireRole } = require('../../middleware/roleMiddleware')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', requireAuth, getMe)
router.get('/pending-staff', requireAuth, requireRole(['ADMIN']), getPendingStaff)
router.patch('/approve-staff/:id', requireAuth, requireRole(['ADMIN']), approveStaff)

router.get('/users', requireAuth, requireRole(['ADMIN']), getAllUsers)
router.post('/impersonate/:id', requireAuth, requireRole(['ADMIN']), impersonateUser)

module.exports = router
