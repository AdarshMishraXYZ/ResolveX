import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser, getDepartments } from '../../api/authApi'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Register = () => {
  const [accountType, setAccountType] = useState('CITIZEN')
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '', departmentId: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (accountType === 'STAFF') {
      getDepartments().then((res) => setDepartments(res.data.departments)).catch(() => {})
    }
  }, [accountType])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { name: form.name, email: form.email, password: form.password }
      if (accountType === 'STAFF') {
        payload.role = 'STAFF'
        payload.departmentId = form.departmentId
      }

      const res = await registerUser(payload)

      if (accountType === 'STAFF') {
        toast.success('Registered! Your account is pending admin approval.')
        navigate('/login')
        return
      }

      login(res.data.token, res.data.user)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Registration failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">ResolveX</h1>
          <p className="text-gray-500 mt-2">Create your account</p>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setAccountType('CITIZEN')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              accountType === 'CITIZEN' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
            }`}
          >
            I have a complaint
          </button>
          <button
            type="button"
            onClick={() => setAccountType('STAFF')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              accountType === 'STAFF' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
            }`}
          >
            I work here
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {accountType === 'STAFF' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select your department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1.5">
                Your account needs admin approval before you can log in.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : accountType === 'STAFF' ? 'Submit for approval' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
