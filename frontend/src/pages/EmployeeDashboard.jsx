
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import API_URL from "../api";
function EmployeeDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [leaves, setLeaves] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (!token || !savedUser) {
      navigate('/login', { replace: true })
      return
    }

    try {
      const parsedUser = JSON.parse(savedUser)

      if (parsedUser.role !== 'employee') {
        navigate('/admin-dashboard', { replace: true })
        return
      }

      setUser(parsedUser)
      fetchLeaves(token)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const fetchLeaves = async (token) => {
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
        throw new Error(data.message || 'Could not load leave applications.')
      }

      setLeaves(Array.isArray(data) ? data : data.leaveApplications || [])
    } catch (err) {
      setError(err.message || 'Could not load leave applications.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  const pendingCount = leaves.filter(
    (leave) => leave.leaveStatus === 'Pending',
  ).length

  const approvedCount = leaves.filter(
    (leave) => leave.leaveStatus === 'Approved',
  ).length

  const rejectedCount = leaves.filter(
    (leave) => leave.leaveStatus === 'Rejected',
  ).length

  if (!user) {
    return <div className="dashboard-loading">Loading dashboard...</div>
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link to="/" className="auth-brand">
          <span className="brand-icon">EL</span>
          <span>LeavePortal</span>
        </Link>

        <div className="dashboard-user">
          <span>{user.name}</span>
          <button className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">EMPLOYEE WORKSPACE</p>
            <h1>Welcome, {user.name}!</h1>
            <p>Manage your leave applications from one place.</p>
          </div>

          <Link to="/apply-leave" className="btn btn-primary">
            + Apply for Leave
          </Link>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="dashboard-stats">
          <article className="stat-card">
            <span className="stat-label">Total Applications</span>
            <strong>{leaves.length}</strong>
          </article>

          <article className="stat-card">
            <span className="stat-label">Pending</span>
            <strong>{pendingCount}</strong>
          </article>

          <article className="stat-card">
            <span className="stat-label">Approved</span>
            <strong>{approvedCount}</strong>
          </article>

          <article className="stat-card">
            <span className="stat-label">Rejected</span>
            <strong>{rejectedCount}</strong>
          </article>
        </div>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Leave Applications</h2>
              <p>Check the latest status of your requests.</p>
            </div>

            <Link to="/leave-history">View History â†’</Link>
          </div>

          {leaves.length === 0 ? (
            <div className="dashboard-empty">
              <h3>No leave applications yet</h3>
              <p>Your submitted leave requests will appear here.</p>
              <Link to="/apply-leave" className="btn btn-primary">
                Apply for your first leave
              </Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.slice(0, 5).map((leave) => (
                    <tr key={leave._id}>
                      <td>{leave.leaveType}</td>
                      <td>
                        {new Date(leave.fromDate).toLocaleDateString()}
                      </td>
                      <td>
                        {new Date(leave.toDate).toLocaleDateString()}
                      </td>
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

        <section className="dashboard-panel">
          <h2>Quick Links</h2>
          <div className="quick-links">
            <Link to="/apply-leave" className="quick-link">
              <strong>Apply for Leave</strong>
              <span>Submit a new leave request â†’</span>
            </Link>

            <Link to="/leave-history" className="quick-link">
              <strong>Leave History</strong>
              <span>Review your previous applications â†’</span>
            </Link>

            <Link to="/profile" className="quick-link">
              <strong>My Profile</strong>
              <span>View and update your details â†’</span>
            </Link>
          </div>
        </section>
      </section>
    </main>
  )
}

export default EmployeeDashboard


