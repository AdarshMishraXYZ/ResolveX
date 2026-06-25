const path = require("path")
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")

const UPLOAD_DIR = path.join(__dirname, "../../uploads")

if (fs.existsSync(UPLOAD_DIR) === false) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const uploadToS3 = async (file) => {
  const filename = uuidv4() + "-" + file.originalname.replace(/\s/g, "-")
  const filepath = path.join(UPLOAD_DIR, filename)
  fs.writeFileSync(filepath, file.buffer)
  const fileUrl = "/uploads/" + filename
  return { key: filename, fileUrl }
}

const deleteFromS3 = async (key) => {
  const filepath = path.join(UPLOAD_DIR, key)
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
}

module.exports = { uploadToS3, deleteFromS3 }
