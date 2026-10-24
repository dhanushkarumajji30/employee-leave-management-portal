
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import API_URL from "../api";
function ManageLeaves() {
  const navigate = useNavigate()
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

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

  const fetchLeaves = async (token) => {
    try {
      setLoading(true)
      setError('')

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
        throw new Error(data.message || 'Unable to load leave requests.')
      }

      setLeaves(
        Array.isArray(data) ? data : data.leaveApplications || [],
      )
    } catch (err) {
      setError(err.message || 'Unable to load leave requests.')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (leaveId, leaveStatus) => {
    setError('')
    setMessage('')
    setUpdatingId(leaveId)

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `${API_URL}/api/leaveApplications/${leaveId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ leaveStatus }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update leave status.')
      }

      setLeaves((currentLeaves) =>
        currentLeaves.map((leave) =>
          leave._id === leaveId
            ? { ...leave, ...data, leaveStatus }
            : leave,
        ),
      )

      setMessage(`Leave request ${leaveStatus.toLowerCase()} successfully.`)
    } catch (err) {
      setError(err.message || 'Unable to update leave status.')
    } finally {
      setUpdatingId(null)
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
        <Link to="/admin-dashboard" className="auth-brand">
          <span className="brand-icon">EL</span>
          <span>LeavePortal Admin</span>
        </Link>

        <Link to="/admin-dashboard" className="btn btn-outline">
          &larr; Dashboard
        </Link>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">ADMIN WORKSPACE</p>
            <h1>Manage Leave Requests</h1>
            <p>Review applications and approve or reject pending requests.</p>
          </div>

          <button
            className="btn btn-outline"
            onClick={() => fetchLeaves(localStorage.getItem('token'))}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}
        {message && <div className="form-success">{message}</div>}

        <section className="dashboard-panel">
          {loading ? (
            <p>Loading leave requests...</p>
          ) : leaves.length === 0 ? (
            <div className="dashboard-empty">
              <h3>No leave requests found</h3>
              <p>Applications submitted by employees will appear here.</p>
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
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>{leave.employeeId || 'â€”'}</td>
                      <td>{leave.leaveType}</td>
                      <td>{formatDate(leave.fromDate)}</td>
                      <td>{formatDate(leave.toDate)}</td>
                      <td>{leave.reason}</td>
                      <td>
                        <span
                          className={`status-badge status-${String(
                            leave.leaveStatus || 'Pending',
                          ).toLowerCase()}`}
                        >
                          {leave.leaveStatus || 'Pending'}
                        </span>
                      </td>
                      <td>
                        {leave.leaveStatus === 'Pending' ? (
                          <div className="leave-action-buttons">
                            <button
                              className="btn btn-approve"
                              disabled={updatingId === leave._id}
                              onClick={() =>
                                updateStatus(leave._id, 'Approved')
                              }
                            >
                              Approve
                            </button>

                            <button
                              className="btn btn-reject"
                              disabled={updatingId === leave._id}
                              onClick={() =>
                                updateStatus(leave._id, 'Rejected')
                              }
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="action-completed">Reviewed</span>
                        )}
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

export default ManageLeaves


