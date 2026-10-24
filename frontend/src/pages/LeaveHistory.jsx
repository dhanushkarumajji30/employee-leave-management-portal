
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import API_URL from "../api";
function LeaveHistory() {
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

      if (user.role !== 'employee') {
        navigate('/admin-dashboard', { replace: true })
        return
      }

      fetchLeaveHistory(token)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const fetchLeaveHistory = async (token) => {
    try {
      const response = await fetch(
        `${API_URL}/api/leaveApplications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load leave history.')
      }

      const applications = Array.isArray(data)
        ? data
        : data.leaveApplications || []

      setLeaves(applications)
    } catch (err) {
      setError(err.message || 'Unable to load leave history.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'â€”'

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link to="/employee-dashboard" className="auth-brand">
          <span className="brand-icon">EL</span>
          <span>LeavePortal</span>
        </Link>

        <Link to="/employee-dashboard" className="btn btn-outline">
          &larr; Dashboard
        </Link>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">EMPLOYEE WORKSPACE</p>
            <h1>Leave History</h1>
            <p>Review your submitted leave applications and their status.</p>
          </div>

          <Link to="/apply-leave" className="btn btn-primary">
            + Apply for Leave
          </Link>
        </div>

        {error && <div className="form-error">{error}</div>}

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Your Applications</h2>
              <p>Total applications: {leaves.length}</p>
            </div>
          </div>

          {loading ? (
            <p>Loading leave history...</p>
          ) : leaves.length === 0 && !error ? (
            <div className="dashboard-empty">
              <h3>No applications found</h3>
              <p>Your leave applications will appear here after submission.</p>
              <Link to="/apply-leave" className="btn btn-primary">
                Apply for Leave
              </Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Reason</th>
                    <th>Applied On</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>{leave.leaveType}</td>
                      <td>{formatDate(leave.fromDate)}</td>
                      <td>{formatDate(leave.toDate)}</td>
                      <td>{leave.reason}</td>
                      <td>{formatDate(leave.applicationDate)}</td>
                      <td>
                        <span
                          className={`status-badge status-${String(
                            leave.leaveStatus || 'Pending',
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

export default LeaveHistory


