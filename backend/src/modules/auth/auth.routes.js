const express = require('express')
const { register, login, getMe, getPendingStaff, approveStaff } = require('./auth.controller')
const { requireAuth } = require('../../middleware/authMiddleware')
const { requireRole } = require('../../middleware/roleMiddleware')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', requireAuth, getMe)
router.get('/pending-staff', requireAuth, requireRole(['ADMIN']), getPendingStaff)
router.patch('/approve-staff/:id', requireAuth, requireRole(['ADMIN']), approveStaff)

module.exports = router
