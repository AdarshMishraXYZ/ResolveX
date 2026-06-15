const http = require('http')
const { Server } = require('socket.io')
const app = require('./app')
require('dotenv').config()

const PORT = process.env.PORT || 5000

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`)
    console.log(`User ${userId} joined their room`)
  })

  socket.on('joinDepartment', (departmentId) => {
    socket.join(`department_${departmentId}`)
    console.log(`Joined department room: ${departmentId}`)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

global.io = io

server.listen(PORT, () => {
  console.log(`ResolveX server running on port ${PORT}`)
})