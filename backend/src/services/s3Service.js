const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3")
const { v4: uuidv4 } = require("uuid")
require("dotenv").config()

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

const uploadToS3 = async (file) => {
  const key = "complaints/" + uuidv4() + "-" + file.originalname.replace(/\s/g, "-")

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  })

  await s3.send(command)

  const fileUrl = "https://" + process.env.AWS_BUCKET_NAME + ".s3." + process.env.AWS_REGION + ".amazonaws.com/" + key

  return { key, fileUrl }
}

const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  })
  await s3.send(command)
}

module.exports = { uploadToS3, deleteFromS3 }
