
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'

const emptyForm = {
  employeeId: '',
  employeeName: '',
  department: '',
  designation: '',
  email: '',
  mobile: '',
}

function ManageEmployees() {
  const navigate = useNavigate()

  const [employees, setEmployees] = useState([])
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

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

      fetchEmployees(token)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const fetchEmployees = async (token = localStorage.getItem('token')) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        'http://localhost:5000/api/employees',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load employees.')
      }

      setEmployees(Array.isArray(data) ? data : data.employees || [])
    } catch (err) {
      setError(err.message || 'Unable to load employees.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      setSaving(true)

      const token = localStorage.getItem('token')
      const isEditing = Boolean(editingId)

      const response = await fetch(
        isEditing
          ? `http://localhost:5000/api/employees/${editingId}`
          : 'http://localhost:5000/api/employees',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            employeeId: formData.employeeId.trim(),
            employeeName: formData.employeeName.trim(),
            department: formData.department.trim(),
            designation: formData.designation.trim(),
            email: formData.email.trim().toLowerCase(),
            mobile: formData.mobile.trim(),
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save employee.')
      }

      setMessage(
        isEditing
          ? 'Employee updated successfully.'
          : 'Employee added successfully.',
      )

      resetForm()
      await fetchEmployees(token)
    } catch (err) {
      setError(err.message || 'Unable to save employee.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (employee) => {
    setFormData({
      employeeId: employee.employeeId || '',
      employeeName: employee.employeeName || '',
      department: employee.department || '',
      designation: employee.designation || '',
      email: employee.email || '',
      mobile: employee.mobile || '',
    })

    setEditingId(employee._id)
    setError('')
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.employeeName}?`,
    )

    if (!confirmed) return

    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `http://localhost:5000/api/employees/${employee._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete employee.')
      }

      setEmployees((current) =>
        current.filter((item) => item._id !== employee._id),
      )

      if (editingId === employee._id) {
        resetForm()
      }

      setMessage('Employee deleted successfully.')
    } catch (err) {
      setError(err.message || 'Unable to delete employee.')
    }
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
            <h1>Manage Employees</h1>
            <p>Add, edit, view, and delete employee records.</p>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}
        {message && <div className="form-success">{message}</div>}

        <section className="dashboard-panel">
          <h2>{editingId ? 'Edit Employee' : 'Add New Employee'}</h2>

          <form className="leave-form" onSubmit={handleSubmit}>
            <label htmlFor="employeeId">Employee ID</label>
            <input
              id="employeeId"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="e.g. EMP1001"
              required
            />

            <label htmlFor="employeeName">Full Name</label>
            <input
              id="employeeName"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              placeholder="Employee name"
              required
            />

            <label htmlFor="department">Department</label>
            <input
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Computer Science"
              required
            />

            <label htmlFor="designation">Designation</label>
            <input
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g. Software Engineer"
              required
            />

            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="employee@example.com"
              required
            />

            <label htmlFor="mobile">Mobile Number</label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
              maxLength={10}
              required
            />

            <div className="employee-form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Employee'
                    : 'Add Employee'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Employee Records</h2>
              <p>Total employees: {employees.length}</p>
            </div>

            <button
              className="btn btn-outline"
              onClick={() => fetchEmployees()}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p>Loading employees...</p>
          ) : employees.length === 0 ? (
            <div className="dashboard-empty">
              <h3>No employees found</h3>
              <p>Add an employee using the form above.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee._id}>
                      <td>{employee.employeeId}</td>
                      <td>{employee.employeeName}</td>
                      <td>{employee.department}</td>
                      <td>{employee.designation}</td>
                      <td>{employee.email}</td>
                      <td>{employee.mobile}</td>
                      <td>
                        <div className="employee-form-actions">
                          <button
                            className="btn btn-outline"
                            onClick={() => handleEdit(employee)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-reject"
                            onClick={() => handleDelete(employee)}
                          >
                            Delete
                          </button>
                        </div>
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

export default ManageEmployees
