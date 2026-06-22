const express = require("express")
const multer = require("multer")
const { requireAuth } = require("../../middleware/authMiddleware")
const prisma = require("../../config/db")
const { uploadToS3 } = require("../../services/s3Service")

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Only JPEG, PNG, WebP and PDF files are allowed"))
    }
  },
})

router.post("/:id/attachments", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" })

    const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } })
    if (!complaint) return res.status(404).json({ message: "Complaint not found" })

    if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === "") {
      return res.status(503).json({ message: "File upload not configured yet. Add AWS credentials to enable this feature." })
    }

    const { key, fileUrl } = await uploadToS3(req.file)

    const attachment = await prisma.attachment.create({
      data: {
        complaintId: req.params.id,
        s3Key: key,
        fileUrl,
        fileType: req.file.mimetype,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        complaintId: req.params.id,
        action: "ATTACHMENT_ADDED",
        newValue: req.file.originalname,
      },
    })

    res.status(201).json({ message: "File uploaded successfully", attachment })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get("/:id/attachments", requireAuth, async (req, res) => {
  try {
    const attachments = await prisma.attachment.findMany({
      where: { complaintId: req.params.id },
      orderBy: { createdAt: "asc" },
    })
    res.json({ attachments })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
