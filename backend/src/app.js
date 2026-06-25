const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const authRoutes = require('./modules/auth/auth.routes')
const complaintRoutes = require('./modules/complaints/complaint.routes')
const attachmentRoutes = require('./modules/complaints/attachment.routes')
const departmentRoutes = require('./modules/departments/department.routes')
const notificationRoutes = require('./modules/notifications/notification.routes')
const analyticsRoutes = require('./modules/analytics/analytics.routes')
const errorMiddleware = require('./middleware/errorMiddleware')

const app = express()

const path = require('path')

app.use(helmet())
app.use('/uploads', require('express').static(require('path').join(__dirname, '../uploads')))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})
app.use(limiter)

app.use('/api/auth', authRoutes)
app.use('/api/complaints', complaintRoutes)
app.use('/api/complaints', attachmentRoutes)
app.use('/api/departments', departmentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/analytics', analyticsRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ResolveX API is running' })
})

app.use(errorMiddleware)

module.exports = app