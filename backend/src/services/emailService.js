const { Resend } = require("resend")

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "ResolveX <onboarding@resend.dev>"

const sendEmail = async ({ to, subject, html }) => {
  if (process.env.RESEND_API_KEY === undefined || process.env.RESEND_API_KEY === "") {
    console.log("[Email] Skipping - RESEND_API_KEY not configured")
    return
  }
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html })
    console.log("[Email] Sent to", to)
  } catch (error) {
    console.error("[Email] Failed:", error.message)
  }
}

const sendComplaintCreatedEmail = async ({ citizenEmail, citizenName, complaintTitle, department, priority }) => {
  if (citizenEmail === null || citizenEmail === undefined) return
  await sendEmail({
    to: citizenEmail,
    subject: "ResolveX: Your complaint has been received",
    html: "<div style=font-family:sans-serif;max-width:600px;margin:auto;padding:24px><h2 style=color:#1A1A18>Complaint Received</h2><p>Hi " + citizenName + ",</p><p>Your complaint <strong>" + complaintTitle + "</strong> has been submitted and routed to the <strong>" + department + "</strong> department.</p><p>Priority: <strong>" + priority + "</strong></p><p>Log in to ResolveX to track its progress.</p><br><p style=color:#888>ResolveX Team</p></div>",
  })
}

const sendStatusUpdateEmail = async ({ citizenEmail, citizenName, complaintTitle, newStatus }) => {
  if (citizenEmail === null || citizenEmail === undefined) return
  await sendEmail({
    to: citizenEmail,
    subject: "ResolveX: Your complaint status has been updated",
    html: "<div style=font-family:sans-serif;max-width:600px;margin:auto;padding:24px><h2 style=color:#1A1A18>Status Update</h2><p>Hi " + citizenName + ",</p><p>Your complaint <strong>" + complaintTitle + "</strong> status changed to: <strong>" + newStatus.replace(/_/g, " ") + "</strong></p><p>Log in to ResolveX to see full details.</p><br><p style=color:#888>ResolveX Team</p></div>",
  })
}

const sendNewComplaintToStaffEmail = async ({ staffEmails, complaintTitle, department, location, priority }) => {
  for (const email of staffEmails) {
    await sendEmail({
      to: email,
      subject: "ResolveX: New complaint in your department",
      html: "<div style=font-family:sans-serif;max-width:600px;margin:auto;padding:24px><h2 style=color:#1A1A18>New Complaint</h2><p>A new complaint has been assigned to the <strong>" + department + "</strong> department.</p><ul><li><strong>Title:</strong> " + complaintTitle + "</li><li><strong>Location:</strong> " + (location || "Not specified") + "</li><li><strong>Priority:</strong> " + priority + "</li></ul><p>Log in to ResolveX to act on this complaint.</p><br><p style=color:#888>ResolveX Team</p></div>",
    })
  }
}

module.exports = { sendEmail, sendComplaintCreatedEmail, sendStatusUpdateEmail, sendNewComplaintToStaffEmail }
