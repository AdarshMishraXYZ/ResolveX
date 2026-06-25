import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createComplaint, uploadAttachment } from '../../api/complaintApi'
import toast from 'react-hot-toast'
import { Paperclip, X } from 'lucide-react'

const CreateComplaint = () => {
  const [form, setForm] = useState({ title: '', description: '', location: '' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected && selected.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }
    setFile(selected || null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await createComplaint(form)
      const complaintId = res.data.complaint.id

      if (file) {
        try {
          await uploadAttachment(complaintId, file)
        } catch {
          toast.error('Complaint submitted but file upload failed')
        }
      }

      toast.success('Complaint submitted — routing it to the right department')
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
              placeholder="Describe what's happening in your own words"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attach a photo (optional)</label>
            {file ? (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                <Paperclip size={16} className="text-blue-600 flex-shrink-0" />
                <span className="text-sm text-blue-700 flex-1 truncate">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 transition">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-4 hover:border-blue-400 hover:bg-blue-50 transition">
                <Paperclip size={16} className="text-gray-400" />
                <span className="text-sm text-gray-500">Click to attach an image or PDF (max 5MB)</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                />
              </label>
            )}
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
