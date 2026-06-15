const prisma = require('../config/db')

const createNotification = async ({ userId, complaintId, type, message }) => {
  const notification = await prisma.notification.create({
    data: { userId, complaintId, type, message },
  })

  if (global.io) {
    global.io.to(`user_${userId}`).emit('notification', { notification })
  }

  return notification
}

module.exports = { createNotification }