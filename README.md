# ResolveX — Smart Complaint Routing & Public Service Workflow System

A production-grade full-stack workflow platform for complaint intake, automated department routing, SLA-based escalation, real-time status tracking, and department performance analytics.

---

## What this project does

Most complaint systems are just forms that store data. ResolveX is a workflow engine. Every complaint moves through a defined state machine, every transition is role-gated, every action is audit-logged, and the system escalates automatically when deadlines are missed.

A citizen describes a problem in plain text. The routing engine reads it, scores it against keyword rules, assigns it to the right department with a confidence score and a stated reason, and sets an SLA deadline based on priority. Staff see it in their department queue. They work it through the workflow. The citizen watches it move in real time via Socket.IO. Missed deadlines escalate automatically.

---

## Engineering decisions

### Optimistic concurrency control
Status transitions use a version column with a conditional WHERE id = ? AND version = ? update. Two simultaneous requests with the same version will have exactly one succeed and one receive a 409 Conflict. Verified with a real concurrent curl race during development.

### Explainable routing engine
The routing engine scores every department by total keyword overlap, picks the strongest signal, and returns a confidence percentage and a reasoning string explaining which keywords triggered the decision.

### Department-scoped authorization
getComplaintById and getAllComplaints enforce department membership at the query level, not just in the UI. A staff member in IT cannot fetch a Maintenance complaint by URL even if they know the UUID. DEPARTMENT_HEAD is scoped the same way.

### Staff approval gate
Anyone can register as staff by selecting a department. Their account starts as PENDING and cannot log in until an admin explicitly approves it. This prevents random signups from accessing the complaint queue.

### Clean workflow transition table
The WorkflowTransition table defines exactly which roles can perform which state transitions. Checked at the database level on every status update, not just in the frontend.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT, bcrypt |
| Real-time | Socket.IO |
| File storage | Amazon S3 |
| Deployment | AWS Amplify, Elastic Beanstalk, RDS, CloudWatch |

---

## User roles

| Role | Responsibility |
|---|---|
| Citizen | Submits complaints, tracks status, messages staff |
| Staff | Works assigned complaints through the queue |
| Department Head | Assigns work, signs off on resolutions, escalates |
| Admin | Approves staff accounts, closes complaints, monitors all |

---

## Departments

IT, Maintenance, Hostel, Administration, Electrical, Sanitation.

Ten trade skills: Electrician, Plumber, Carpenter, Painter, AC Technician, Mason, Cleaner, IT Technician, Gardener, Locksmith.

---

## Complaint workflow

SUBMITTED (Staff) -> UNDER_REVIEW (Dept Head) -> ASSIGNED (Staff) -> IN_PROGRESS (Staff) -> VERIFICATION (Dept Head) -> RESOLVED (Admin) -> CLOSED

Exceptions: REJECTED, ESCALATED, REOPENED — each with their own role gates.

---

## Key API endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/pending-staff | Admin only |
| PATCH | /api/auth/approve-staff/:id | Admin only |
| GET | /api/departments | Public |
| POST | /api/complaints | Citizen |
| GET | /api/complaints/my | Citizen |
| GET | /api/complaints | Staff / Head / Admin |
| PATCH | /api/complaints/:id/status | Role-gated transitions |
| GET | /api/analytics/overview | Head / Admin |

---

## Local setup

```bash
git clone https://github.com/AdarshMishraXYZ/ResolveX.git
cd ResolveX/backend
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

---

entials |

---

*Built as a portfolio project demonstrating production-style backend engineering, system design, and AWS deployment.*
