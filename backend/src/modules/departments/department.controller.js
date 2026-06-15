const prisma = require('../../config/db')

const getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany()
    res.json({ departments })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getAllDepartments }