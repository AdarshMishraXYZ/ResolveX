import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createComplaint } from '../../api/complaintApi'
import toast from 'react-hot-toast'

const CreateComplaint = () => {
  const [form, setForm] = useState({ title: '', description: '', location: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createComplaint(form)
      toast.success('Complaint submitted — we are routing it to the right department')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Submit a complaint</h1>
        <p className="text-gray-500 text-sm mt-1">
          Just describe what's wrong. We'll figure out who handles it.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief title of your complaint"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What's the problem?</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={5}
              placeholder="Describe what's happening in your own words — e.g. 'the chair in the library is broken and there aren't enough seats'"
              required
            />
            <p className="text-xs text-gray-400 mt-1.5">
              No need to pick a department or category — we'll route this automatically.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Block A, Room 204"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm"
            >
              {loading ? 'Submitting...' : 'Submit complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateComplaint