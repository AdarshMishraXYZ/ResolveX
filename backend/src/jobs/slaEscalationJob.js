const cron = require("node-cron")
const prisma = require("../config/db")
const { createNotification } = require("../services/notificationService")

const runEscalationCheck = async () => {
  console.log("[SLA Job] Running at", new Date().toISOString())
  try {
    const overdueComplaints = await prisma.complaint.findMany({
      where: {
        dueAt: { lt: new Date() },
        status: { notIn: ["RESOLVED", "CLOSED", "REJECTED", "ESCALATED"] },
      },
      include: {
        department: true,
        createdBy: { select: { id: true, name: true } },
      },
    })

    console.log("[SLA Job] Found", overdueComplaints.length, "overdue complaints")

    for (const complaint of overdueComplaints) {
      const alreadyEscalated = await prisma.auditLog.findFirst({
        where: { complaintId: complaint.id, action: "SLA_ESCALATED" },
      })

      if (alreadyEscalated) {
        console.log("[SLA Job] Skipping", complaint.id, "- already escalated")
        continue
      }

      await prisma.complaint.update({
        where: { id: complaint.id },
        data: { status: "ESCALATED", version: { increment: 1 } },
      })

      await prisma.auditLog.create({
        data: {
          actorId: complaint.createdById,
          complaintId: complaint.id,
          action: "SLA_ESCALATED",
          oldValue: complaint.status,
          newValue: "ESCALATED",
        },
      })

      await createNotification({
        userId: complaint.createdById,
        complaintId: complaint.id,
        type: "SLA_BREACH",
        message: "Your complaint " + complaint.title + " has been escalated because the deadline was missed.",
      })

      if (global.io) {
        global.io.to("user_" + complaint.createdById).emit("statusUpdate", {
          complaintId: complaint.id,
          status: "ESCALATED",
        })
      }

      console.log("[SLA Job] Escalated:", complaint.title)
    }

    console.log("[SLA Job] Done")
  } catch (error) {
    console.error("[SLA Job] Error:", error.message)
  }
}

const startSlaEscalationJob = () => {
  cron.schedule("*/15 * * * *", runEscalationCheck)
  console.log("[SLA Job] Scheduled - runs every 15 minutes")
  runEscalationCheck()
}

module.exports = { startSlaEscalationJob, runEscalationCheck }
