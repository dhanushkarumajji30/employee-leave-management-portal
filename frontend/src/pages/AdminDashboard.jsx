
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'

function AdminDashboard() {
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

      fetchLeaves(token)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const fetchLeaves = async (
    token = localStorage.getItem('token'),
  ) => {
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
        throw new Error(
          data.message || 'Failed to load leave applications.',
        )
      }

      const applications = Array.isArray(data)
        ? data
        : data.leaveApplications || []

      setLeaves(applications)
    } catch (err) {
      setError(
        err.message || 'Unable to load leave applications.',
      )
    } finally {
      setLoading(false)
    }
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  const formatDate = (date) => {
    if (!date) return '-'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return '-'

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusClass = (status) => {
    const normalizedStatus = (status || 'Pending').toLowerCase()

    if (
      ['pending', 'approved', 'rejected'].includes(normalizedStatus)
    ) {
      return `status-${normalizedStatus}`
    }

    return 'status-pending'
  }

  const recentLeaves = [...leaves]
    .sort(
      (a, b) =>
        new Date(b.applicationDate || b.createdAt || 0).getTime() -
        new Date(a.applicationDate || a.createdAt || 0).getTime(),
    )
    .slice(0, 5)

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link to="/admin-dashboard" className="auth-brand">
          <span className="brand-icon">EL</span>
          <span>LeavePortal Admin</span>
        </Link>

        <div className="employee-form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => fetchLeaves()}
            disabled={loading}
          >
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">ADMIN WORKSPACE</p>
            <h1>Admin Dashboard</h1>
            <p>
              Manage employees, review leave requests, and view reports.
            </p>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <section className="dashboard-stats">
          <article className="stat-card">
            <p>Total Applications</p>
            <h2>{loading ? '...' : leaves.length}</h2>
          </article>

          <article className="stat-card">
            <p>Pending Requests</p>
            <h2>{loading ? '...' : pendingCount}</h2>
          </article>

          <article className="stat-card">
            <p>Approved Requests</p>
            <h2>{loading ? '...' : approvedCount}</h2>
          </article>

          <article className="stat-card">
            <p>Rejected Requests</p>
            <h2>{loading ? '...' : rejectedCount}</h2>
          </article>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Admin Actions</h2>
              <p>Choose a module to manage the portal.</p>
            </div>
          </div>

          <div className="quick-links">
            <Link to="/manage-leaves" className="quick-link">
              <span>📋</span>
              <div>
                <h3>Manage Leave Requests</h3>
                <p>Review, approve, or reject applications.</p>
              </div>
            </Link>

            <Link to="/manage-employees" className="quick-link">
              <span>👥</span>
              <div>
                <h3>Manage Employees</h3>
                <p>Add, edit, view, and delete employee records.</p>
              </div>
            </Link>

            <Link to="/leave-reports" className="quick-link">
              <span>📊</span>
              <div>
                <h3>Leave Reports</h3>
                <p>View application totals and leave records.</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Leave Applications</h2>
              <p>Showing the latest five applications.</p>
            </div>

            <Link to="/manage-leaves" className="btn btn-outline">
              View All
            </Link>
          </div>

          {loading ? (
            <p>Loading leave applications...</p>
          ) : leaves.length === 0 ? (
            <div className="dashboard-empty">
              <h3>No leave applications yet</h3>
              <p>Employee leave requests will appear here.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Leave Type</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Applied On</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentLeaves.map((leave) => (
                    <tr key={leave._id || leave.leaveId}>
                      <td>{leave.employeeId || '-'}</td>
                      <td>{leave.leaveType || '-'}</td>
                      <td>{formatDate(leave.fromDate)}</td>
                      <td>{formatDate(leave.toDate)}</td>
                      <td>{formatDate(leave.applicationDate)}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            leave.leaveStatus,
                          )}`}
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

export default AdminDashboard
