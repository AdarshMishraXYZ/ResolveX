cd /d/ResolveX
node -e "
const fs = require('fs');
const content = \`# ResolveX — Smart Complaint Routing & Public Service Workflow System

A production-grade full-stack workflow platform built for colleges and institutions. Citizens describe problems in plain text — ResolveX routes them to the right department automatically, tracks every action, enforces deadlines, and escalates when things stall.

---

## What makes this different from a basic complaint form

Most complaint systems are CRUD apps with a status dropdown. ResolveX is a workflow engine with real engineering decisions behind it:

- The routing engine **scores and explains** its own decisions — not just keyword matching, but weighted scoring with a confidence percentage and a stated reason
- Status transitions are **validated at the database level** against a WorkflowTransition table — no frontend bypass possible
- Concurrent status updates use **optimistic locking** — two staff members clicking simultaneously will have exactly one succeed and one receive a 409 Conflict, proven with a real concurrent curl race
- Department scoping is enforced **at the query level**, not just the UI — an IT staff member cannot fetch a Maintenance complaint by guessing its UUID
- Staff accounts start as **PENDING** and cannot log in until an admin approves them — prevents random signups from accessing the complaint queue
- The SLA escalation job is **idempotent** — it can run every 15 minutes without ever double-escalating the same complaint
- A **Demo Mode** lets anyone switch between all four roles instantly without logging out — built for presentations and evaluations

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT, bcrypt |
| Real-time | Socket.IO |
| Email | Resend (transactional) |
| File storage | Local (dev), Amazon S3 (production) |
| Deployment | AWS Amplify, Elastic Beanstalk, RDS, CloudWatch |

---

## User roles

| Role | What they actually do |
|---|---|
| Citizen | Submits complaints in plain text, tracks status via live timeline, messages staff, can reopen resolved complaints |
| Staff | Picks up complaints from department queue, marks them resolved, uploads proof |
| Department Head | Assigns complaints to staff, closes resolved ones, escalates stuck complaints to admin |
| Admin | Approves pending staff accounts, monitors all departments, handles escalated complaints, views analytics |

---

## Workflow — simplified for real use

\\\`\\\`\\\`
SUBMITTED → ASSIGNED → RESOLVED → CLOSED
               ↓
           ESCALATED → (Admin resolves or reassigns)
\\\`\\\`\\\`

- **Staff** picks up (SUBMITTED → ASSIGNED) or self-assigns
- **Staff** marks done (ASSIGNED → RESOLVED)
- **Department Head** closes (RESOLVED → CLOSED) or escalates (ASSIGNED → ESCALATED)
- **Admin** handles escalations only — does not participate in normal flow
- **Citizen** can reopen (RESOLVED → SUBMITTED) if unsatisfied

---

## Engineering decisions worth talking about

### Optimistic concurrency control
Every complaint has a \\\`version\\\` integer. Status updates use \\\`WHERE id = ? AND version = ?\\\` — if the version doesn't match, the update affects zero rows and returns 409 Conflict. Verified by firing two concurrent curl requests at the same endpoint and confirming exactly one succeeded.

### Explainable routing engine
The routing engine doesn't stop at the first keyword match. It scores every department by total keyword character overlap, picks the highest score, and returns \\\`{ department, confidence, reasoning }\\\`. The reasoning field (e.g. "Routed based on keywords: toilet, smell, clean") is stored in the audit log on every complaint — every routing decision is permanently inspectable.

### Department-scoped authorization
\\\`getAllComplaints\\\` and \\\`getComplaintById\\\` both apply department filters at the Prisma query level, not the UI. \\\`STAFF\\\` and \\\`DEPARTMENT_HEAD\\\` are scoped identically — a head cannot see other departments' queues. Verified by requesting a cross-department complaint with a staff token and confirming a 403 response.

### Staff approval gate
Staff registration creates a \\\`PENDING\\\` account that is blocked at the login endpoint — the JWT is never issued until an admin approves. The admin sees pending accounts in a dedicated panel with one-click approval.

### SLA escalation with idempotency
A node-cron job runs every 15 minutes. It finds complaints where \\\`dueAt < now\\\` and status is not terminal. Before escalating, it checks for an existing \\\`SLA_ESCALATED\\\` audit log entry — if found, skips. This guarantees at-most-once escalation per complaint regardless of how many times the job fires.

### Demo Mode (admin impersonation)
Admin can switch into any user's perspective without logging out. The original admin token is stored in localStorage and restored on "Return to Admin". An amber banner stays visible showing the current impersonated role. Built specifically to make live demonstrations smooth.

---

## Departments and skills

Six departments: IT, Maintenance, Hostel, Administration, Electrical, Sanitation.

Ten trade skills seeded: Electrician, Plumber, Carpenter, Painter, AC Technician, Mason, Cleaner, IT Technician, Gardener, Locksmith.

Staff can be tagged with skills so department heads can match complaint types to the right person.

---

## Email notifications (Resend)

| Event | Who gets the email |
|---|---|
| Complaint submitted | Citizen (confirmation + routing info) |
| New complaint in department | All active staff in that department |
| Status changes | Citizen (contextual message per status) |
| Complaint escalated | All admin accounts |
| Complaint closed | Citizen (final confirmation) |

---

## Key API endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/pending-staff | Admin |
| PATCH | /api/auth/approve-staff/:id | Admin |
| POST | /api/auth/impersonate/:id | Admin |
| GET | /api/auth/users | Admin |
| GET | /api/departments | Public |
| POST | /api/complaints | Citizen |
| GET | /api/complaints/my | Citizen |
| GET | /api/complaints | Staff / Head / Admin (dept-scoped) |
| GET | /api/complaints/:id | Role + dept scoped |
| PATCH | /api/complaints/:id/status | Role-gated via WorkflowTransition table |
| POST | /api/complaints/:id/attachments | Authenticated |
| GET | /api/analytics/overview | Head / Admin |

---

## Local setup

\\\`\\\`\\\`bash
git clone https://github.com/AdarshMishraXYZ/ResolveX.git

# Backend
cd ResolveX/backend
npm install
cp .env.example .env        # fill DATABASE_URL, JWT_SECRET, RESEND_API_KEY
npx prisma migrate dev
npx prisma generate
npm run seed
npm run dev                  # runs on port 5000

# Frontend (new terminal)
cd ResolveX/frontend
npm install
npm run dev                  # runs on port 5173
\\\`\\\`\\\`

---

## Interview talking points

- How optimistic locking prevents lost updates — and how you proved it with a real concurrent test
- Why department scoping belongs at the query level, not the UI level — and the exact 403 test that proved the fix
- How the routing engine scores and explains its own decisions rather than stopping at the first keyword
- Why the staff approval gate exists and what attack it prevents
- How SLA escalation achieves at-most-once semantics without a distributed lock
- How Demo Mode works — admin impersonation using localStorage token swapping
- How Vite was chosen over CRA — faster builds, modern tooling, industry standard in 2025-26
- Why PostgreSQL over MongoDB — relational data with joins, enforced foreign keys, transactions across multiple tables in a single status update
- How email deliverability works — Resend sandbox vs custom domain with SPF/DKIM/DMARC

---


fs.writeFileSync('README.md', content);
console.log('SUCCESS - lines: ' + content.split('\\n').length);
"
