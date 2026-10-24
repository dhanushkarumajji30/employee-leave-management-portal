
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'

function ApplyLeave() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    leaveType: 'CL',
    fromDate: '',
    toDate: '',
    reason: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (!token || !savedUser) {
      navigate('/login', { replace: true })
      return
    }

    try {
      const user = JSON.parse(savedUser)

      if (user.role !== 'employee') {
        navigate('/admin-dashboard', { replace: true })
      }
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (formData.fromDate < new Date().toLocaleDateString('en-CA')) {
      setError('The starting date cannot be in the past.')
      return
    }

    if (formData.toDate < formData.fromDate) {
      setError('The ending date must be on or after the starting date.')
      return
    }

    if (!formData.reason.trim()) {
      setError('Please enter a reason for your leave.')
      return
    }

    try {
      setLoading(true)

      const token = localStorage.getItem('token')

      const response = await fetch(
        'http://localhost:5000/api/leaveApplications',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            reason: formData.reason.trim(),
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit leave application.')
      }

      setSuccess('Leave application submitted successfully!')
      setFormData({
        leaveType: 'CL',
        fromDate: '',
        toDate: '',
        reason: '',
      })
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to the backend. Check whether the server is running.'
          : err.message,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link to="/employee-dashboard" className="auth-brand">
          <span className="brand-icon">EL</span>
          <span>LeavePortal</span>
        </Link>

        <Link to="/employee-dashboard" className="btn btn-outline">
          ← Dashboard
        </Link>
      </header>

      <section className="leave-form-container">
        <div className="leave-form-heading">
          <p className="dashboard-eyebrow">EMPLOYEE WORKSPACE</p>
          <h1>Apply for Leave</h1>
          <p>Complete the form below to submit your leave request.</p>
        </div>

        <section className="dashboard-panel">
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          <form onSubmit={handleSubmit} className="leave-form">
            <label htmlFor="leaveType">Leave Type</label>
            <select
              id="leaveType"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              required
            >
              <option value="CL">Casual Leave (CL)</option>
              <option value="SL">Sick Leave (SL)</option>
              <option value="EL">Earned Leave (EL)</option>
              <option value="OD">On-Duty (OD)</option>
            </select>

            <div className="leave-date-grid">
              <div>
                <label htmlFor="fromDate">From Date</label>
                <input
                  id="fromDate"
                  name="fromDate"
                  type="date"
                  value={formData.fromDate}
                  min={new Date().toLocaleDateString('en-CA')}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="toDate">To Date</label>
                <input
                  id="toDate"
                  name="toDate"
                  type="date"
                  value={formData.toDate}
                  min={formData.fromDate || new Date().toLocaleDateString('en-CA')}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label htmlFor="reason">Reason for Leave</label>
            <textarea
              id="reason"
              name="reason"
              rows="5"
              placeholder="Explain why you need leave..."
              value={formData.reason}
              onChange={handleChange}
              maxLength={500}
              required
            />

            <p className="leave-form-hint">
              Maximum 500 characters.
            </p>

            <button
              type="submit"
              className="btn btn-primary leave-submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Leave Application'}
            </button>
          </form>
        </section>
      </section>
    </main>
  )
}

export default ApplyLeave
