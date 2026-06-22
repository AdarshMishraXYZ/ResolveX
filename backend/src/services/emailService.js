const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("[Email] Skipping - EMAIL_USER/EMAIL_PASS not configured")
    return
  }
  try {
    await transporter.sendMail({
      from: "ResolveX <" + process.env.EMAIL_USER + ">",
      to,
      subject,
      html,
    })
    console.log("[Email] Sent to", to)
  } catch (error) {
    console.error("[Email] Failed to send to", to, ":", error.message)
  }
}

const sendComplaintCreatedEmail = async ({ citizenEmail, citizenName, complaintTitle, department, priority }) => {
  await sendEmail({
    to: citizenEmail,
    subject: "ResolveX: Your complaint has been received",
    html: "<div style=font-family:sans-serif;max-width:600px;margin:auto><h2 style=color:#1A1A18>Complaint Received</h2><p>Hi " + citizenName + ",</p><p>Your complaint <strong>" + complaintTitle + "</strong> has been submitted and routed to the <strong>" + department + "</strong> department.</p><p>Priority: <strong>" + priority + "</strong></p><p>You can track its progress by logging into ResolveX.</p><br><p style=color:#888>ResolveX Team</p></div>",
  })
}

const sendStatusUpdateEmail = async ({ citizenEmail, citizenName, complaintTitle, newStatus }) => {
  await sendEmail({
    to: citizenEmail,
    subject: "ResolveX: Your complaint status has been updated",
    html: "<div style=font-family:sans-serif;max-width:600px;margin:auto><h2 style=color:#1A1A18>Status Update</h2><p>Hi " + citizenName + ",</p><p>Your complaint <strong>" + complaintTitle + "</strong> has been updated to: <strong>" + newStatus.replace(/_/g, " ") + "</strong></p><p>Log in to ResolveX to see the full details and communicate with staff.</p><br><p style=color:#888>ResolveX Team</p></div>",
  })
}

const sendNewComplaintToStaffEmail = async ({ staffEmails, complaintTitle, department, location, priority }) => {
  for (const email of staffEmails) {
    await sendEmail({
      to: email,
      subject: "ResolveX: New complaint in your department",
      html: "<div style=font-family:sans-serif;max-width:600px;margin:auto><h2 style=color:#1A1A18>New Complaint</h2><p>A new complaint has been assigned to the <strong>" + department + "</strong> department.</p><ul><li><strong>Title:</strong> " + complaintTitle + "</li><li><strong>Location:</strong> " + (location || "Not specified") + "</li><li><strong>Priority:</strong> " + priority + "</li></ul><p>Log in to ResolveX to review and act on this complaint.</p><br><p style=color:#888>ResolveX Team</p></div>",
    })
  }
}

module.exports = { sendEmail, sendComplaintCreatedEmail, sendStatusUpdateEmail, sendNewComplaintToStaffEmail }
