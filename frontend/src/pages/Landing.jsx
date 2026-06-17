import { useNavigate } from 'react-router-dom'

const features = [
  { icon: '🎯', title: 'Smart Auto-Routing', desc: 'Complaints are automatically routed to the right department using keyword intelligence.' },
  { icon: '⚡', title: 'Real-Time Updates', desc: 'Instant notifications when your complaint status changes via Socket.IO.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Department performance, SLA breach tracking, and complaint trends.' },
  { icon: '🔐', title: 'Role-Based Access', desc: 'Citizen, Staff, Department Head, and Admin roles with fine-grained permissions.' },
  { icon: '⏱️', title: 'SLA Enforcement', desc: 'Automatic escalation when deadlines are missed. No complaint falls through the cracks.' },
  { icon: '📝', title: 'Full Audit Trail', desc: 'Every action is logged. Complete accountability and traceability.' },
]

const stats = [
  { value: '6+', label: 'Departments' },
  { value: '4', label: 'User Roles' },
  { value: '10+', label: 'Workflow States' },
  { value: '100%', label: 'Tracked' },
]

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 sticky top-0 bg-white z-50">
        <span className="text-2xl font-bold text-blue-600">ResolveX</span>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-white px-8 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wide">
            Smart Public Service Platform
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Complaints Resolved,<br />
            <span className="text-blue-600">Not Just Recorded</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            ResolveX automatically routes complaints to the right department, tracks every action, enforces SLA deadlines, and keeps citizens informed in real time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Submit a Complaint →
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition"
            >
              Staff Login
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 py-12 px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-bold text-white">{s.value}</p>
              <p className="text-blue-200 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Everything you need to manage complaints</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Built for colleges, government bodies, hospitals, and enterprises.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">How ResolveX works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              { step: '01', title: 'Submit', desc: 'Citizen submits a complaint with description and location' },
              { step: '02', title: 'Auto-Route', desc: 'Smart engine detects category and assigns to right department' },
              { step: '03', title: 'Track', desc: 'Staff updates status through workflow stages with audit logs' },
              { step: '04', title: 'Resolve', desc: 'Citizen gets notified in real time when issue is resolved' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20 px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to resolve complaints faster?</h2>
          <p className="text-blue-200 mb-8">Join ResolveX and bring accountability to your public service workflow.</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition"
          >
            Get Started Free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-8 text-center text-sm">
        <p className="text-white font-semibold text-lg mb-2">ResolveX</p>
        <p>Smart Complaint Routing & Public Service Workflow System</p>
      </footer>
    </div>
  )
}

export default Landing