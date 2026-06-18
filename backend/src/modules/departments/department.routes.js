const express = require('express')
const { getAllDepartments } = require('./department.controller')

const router = express.Router()

router.get('/', getAllDepartments)

module.exports = router
