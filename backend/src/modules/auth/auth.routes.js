const express = require('express')
const { register, login, getMe } = require('./auth.controller')
const { requireAuth } = require('../../middleware/authMiddleware')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', requireAuth, getMe)

module.exports = router