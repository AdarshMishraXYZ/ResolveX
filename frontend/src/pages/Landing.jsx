import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const TIMELINE_STEPS = ['Submitted', 'Under review', 'Assigned', 'In progress', 'Resolved']

const LiveTicket = () => {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % (TIMELINE_STEPS.length + 1))
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white border border-[#E3E0D8] rounded-lg p-8 shadow-sm max-w-md w-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs text-[#5B6470] uppercase tracking-wider mb-1">Ticket #4471</p>
          <p className="font-medium text-[#1A1A18]">Streetlight not working, Block A</p>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded bg-[#B8762E]/10 text-[#B8762E]">
          High priority
        </span>
      </div>

      <div className="space-y-0">
        {TIMELINE_STEPS.map((step, i) => {
          const isDone = i < activeStep
          const isCurrent = i === activeStep
          return (
            <div key={step} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full border transition-colors duration-500 ${
                    isDone || isCurrent
                      ? 'bg-[#B8762E] border-[#B8762E]'
                      : 'bg-transparent border-[#C8C4B8]'
                  }`}
                />
                {i < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`w-px h-8 transition-colors duration-500 ${
                      isDone ? 'bg-[#B8762E]' : 'bg-[#E3E0D8]'
                    }`}
                  />
                )}
              </div>
              <p
                className={`text-sm pb-7 transition-colors duration-500 ${
                  isCurrent ? 'text-[#1A1A18] font-medium' : isDone ? 'text-[#5B6470]' : 'text-[#A8A498]'
                }`}
              >
                {step}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const features = [
  { title: 'Routing', desc: 'Reads the description, assigns a department, and explains why.' },
  { title: 'Deadlines', desc: 'Every ticket gets an SLA. Missed deadlines escalate on their own.' },
  { title: 'Accountability', desc: 'Every status change, comment, and reassignment is logged.' },
  { title: 'Live tracking', desc: 'The person who filed it watches it move, in real time.' },
]

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A18]">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#E3E0D8]">
        <span style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-medium">
          ResolveX
        </span>
        <button
          onClick={() => navigate('/login')}
          className="text-sm font-medium text-[#5B6470] hover:text-[#1A1A18] transition"
        >
          Sign in
        </button>
      </nav>

      <section className="px-8 py-20 md:py-28">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#B8762E] mb-4 font-medium">
              Complaint routing, with a paper trail
            </p>
            <h1
              style={{ fontFamily: 'var(--font-display)' }}
              className="text-4xl md:text-5xl leading-[1.15] mb-6"
            >
              Every complaint has an owner. You can prove it.
            </h1>
            <p className="text-[#5B6470] text-lg leading-relaxed mb-8 max-w-md">
              File an issue and it's read, routed to the right department, and tracked
              until someone closes it. No spreadsheet. No WhatsApp group.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="bg-[#1A1A18] text-white px-6 py-3.5 rounded text-sm font-medium hover:bg-[#1A1A18]/90 transition"
            >
              Report an issue
            </button>
          </div>

          <div className="flex justify-center">
            <LiveTicket />
          </div>
        </div>
      </section>

      <section className="px-8 py-20 border-t border-[#E3E0D8]">
        <div className="max-w-5xl mx-auto">
          <h2
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-2xl mb-12"
          >
            What actually happens after you file
          </h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            {features.map((f) => (
              <div key={f.title} className="border-l-2 border-[#B8762E] pl-5">
                <h3 className="font-medium mb-1.5">{f.title}</h3>
                <p className="text-[#5B6470] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-16 border-t border-[#E3E0D8]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p style={{ fontFamily: 'var(--font-display)' }} className="text-xl mb-1">
              Work here?
            </p>
            <p className="text-[#5B6470] text-sm">
              Register as staff and your department's queue starts the moment an admin approves you.
            </p>
          </div>
          <button
            onClick={() => navigate('/register')}
            className="border border-[#1A1A18] text-[#1A1A18] px-5 py-2.5 rounded text-sm font-medium hover:bg-[#1A1A18] hover:text-white transition whitespace-nowrap"
          >
            Register as staff
          </button>
        </div>
      </section>

      <footer className="px-8 py-8 border-t border-[#E3E0D8] text-center">
        <p className="text-xs text-[#A8A498]">ResolveX — smart complaint routing and public service workflow</p>
      </footer>
    </div>
  )
}

export default Landing
