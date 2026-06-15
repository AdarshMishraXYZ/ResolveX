const express = require('express')
const { requireAuth } = require('../../middleware/authMiddleware')
const { requireRole } = require('../../middleware/roleMiddleware')
const { getOverview } = require('./analytics.controller')

const router = express.Router()

router.get('/overview', requireAuth, requireRole(['DEPARTMENT_HEAD', 'ADMIN']), getOverview)

module.exports = router