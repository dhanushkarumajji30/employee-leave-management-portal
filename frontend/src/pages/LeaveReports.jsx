
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import API_URL from "../api";
function LeaveReports() {
  const navigate = useNavigate()
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (!token || !savedUser) {
      navigate('/login', { replace: true })
      return
    }

    try {
      const user = JSON.parse(savedUser)

      if (user.role !== 'admin') {
        navigate('/employee-dashboard', { replace: true })
        return
      }

      loadReports(token)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const loadReports = async (token = localStorage.getItem('token')) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        'http://localhost:5000/api/leaveApplications',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load leave reports.')
      }

      setLeaves(
        Array.isArray(data) ? data : data.leaveApplications || [],
      )
    } catch (err) {
      setError(err.message || 'Unable to load leave reports.')
    } finally {
      setLoading(false)
    }
  }

  const total = leaves.length
  const pending = leaves.filter(
    (leave) => leave.leaveStatus === 'Pending',
  ).length
  const approved = leaves.filter(
    (leave) => leave.leaveStatus === 'Approved',
  ).length
  const rejected = leaves.filter(
    (leave) => leave.leaveStatus === 'Rejected',
  ).length

  const formatDate = (date) => {
    if (!date) return '-'

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link to="/admin-dashboard" className="auth-brand">
          <span className="brand-icon">EL</span>
          <span>LeavePortal Admin</span>
        </Link>

        <Link to="/admin-dashboard" className="btn btn-outline">
          ← Dashboard
        </Link>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">ADMIN WORKSPACE</p>
            <h1>Leave Reports</h1>
            <p>Review leave application totals and individual requests.</p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => loadReports()}
            disabled={loading}
          >
            Refresh Report
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <section className="dashboard-stats">
          <article className="stat-card">
            <p>Total Applications</p>
            <h2>{loading ? '...' : total}</h2>
          </article>

          <article className="stat-card">
            <p>Pending</p>
            <h2>{loading ? '...' : pending}</h2>
          </article>

          <article className="stat-card">
            <p>Approved</p>
            <h2>{loading ? '...' : approved}</h2>
          </article>

          <article className="stat-card">
            <p>Rejected</p>
            <h2>{loading ? '...' : rejected}</h2>
          </article>
        </section>

        <section className="dashboard-panel">
          <h2>Leave Application Records</h2>

          {loading ? (
            <p>Loading report...</p>
          ) : leaves.length === 0 ? (
            <div className="dashboard-empty">
              <h3>No leave applications found</h3>
              <p>Applications will appear here after employees apply.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Leave Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Applied On</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id || leave.leaveId}>
                      <td>{leave.employeeId || '-'}</td>
                      <td>{leave.leaveType}</td>
                      <td>{formatDate(leave.fromDate)}</td>
                      <td>{formatDate(leave.toDate)}</td>
                      <td>{formatDate(leave.applicationDate)}</td>
                      <td>{leave.reason}</td>
                      <td>
                        <span
                          className={`status-badge status-${(
                            leave.leaveStatus || 'Pending'
                          ).toLowerCase()}`}
                        >
                          {leave.leaveStatus || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default LeaveReports
