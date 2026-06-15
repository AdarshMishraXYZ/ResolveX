const express = require('express')
const { requireAuth } = require('../../middleware/authMiddleware')
const { getAllDepartments } = require('./department.controller')

const router = express.Router()

router.get('/', requireAuth, getAllDepartments)

module.exports = router