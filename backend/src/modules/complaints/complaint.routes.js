const express = require('express')
const { requireAuth } = require('../../middleware/authMiddleware')
const { requireRole } = require('../../middleware/roleMiddleware')
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateStatus,
  addComment,
  assignComplaint,
} = require('./complaint.controller')

const router = express.Router()

router.post('/', requireAuth, createComplaint)
router.get('/my', requireAuth, getMyComplaints)
router.get('/', requireAuth, requireRole(['STAFF', 'DEPARTMENT_HEAD', 'ADMIN']), getAllComplaints)
router.get('/:id', requireAuth, getComplaintById)
router.patch('/:id/status', requireAuth, updateStatus)
router.post('/:id/comments', requireAuth, addComment)
router.post('/:id/assign', requireAuth, requireRole(['DEPARTMENT_HEAD', 'ADMIN']), assignComplaint)

module.exports = router
