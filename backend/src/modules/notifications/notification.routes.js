const express = require('express')
const { requireAuth } = require('../../middleware/authMiddleware')
const { getNotifications, markAsRead } = require('./notification.controller')

const router = express.Router()

router.get('/', requireAuth, getNotifications)
router.patch('/:id/read', requireAuth, markAsRead)

module.exports = router