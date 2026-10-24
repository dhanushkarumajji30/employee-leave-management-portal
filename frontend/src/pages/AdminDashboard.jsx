
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaves = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/leaveApplications`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401 || response.status === 403) {
          setError("You are not authorized to view leave applications.");
          setLeaves([]);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch leave applications.");
        }

        const data = await response.json();

        setLeaves(Array.isArray(data) ? data : data.leaveApplications || []);
      } catch (err) {
        console.error("Error fetching leave applications:", err);
        setError(
          "Unable to load leave applications. Please check your connection."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [navigate]);

  const pendingLeaves = leaves.filter(
    (leave) => leave.leaveStatus === "Pending"
  ).length;

  const approvedLeaves = leaves.filter(
    (leave) => leave.leaveStatus === "Approved"
  ).length;

  const rejectedLeaves = leaves.filter(
    (leave) => leave.leaveStatus === "Rejected"
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "approved";
      case "Rejected":
        return "rejected";
      default:
        return "pending";
    }
  };

  return (
    <div className="admin-dashboard">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .admin-dashboard {
          min-height: 100vh;
          padding: 30px;
          background: #f4f7fb;
          color: #1e293b;
          font-family: Arial, sans-serif;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 30px;
        }

        .admin-header h1 {
          margin: 0 0 8px;
          font-size: 28px;
        }

        .admin-header p {
          margin: 0;
          color: #64748b;
        }

        .logout-button {
          padding: 10px 18px;
          border: none;
          border-radius: 8px;
          background: #dc2626;
          color: white;
          cursor: pointer;
          font-size: 14px;
        }

        .logout-button:hover {
          background: #b91c1c;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          padding: 22px;
          border-radius: 12px;
          background: white;
          box-shadow: 0 3px 12px rgba(15, 23, 42, 0.06);
        }

        .stat-card p {
          margin: 0 0 12px;
          color: #64748b;
          font-size: 14px;
        }

        .stat-card h2 {
          margin: 0;
          font-size: 30px;
        }

        .management-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .management-card {
          display: block;
          padding: 24px;
          border-radius: 12px;
          background: white;
          color: #1e293b;
          text-decoration: none;
          box-shadow: 0 3px 12px rgba(15, 23, 42, 0.06);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .management-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 7px 18px rgba(15, 23, 42, 0.1);
        }

        .card-icon {
          margin-bottom: 14px;
          font-size: 34px;
        }

        .management-card h3 {
          margin: 0 0 10px;
          font-size: 18px;
        }

        .management-card p {
          margin: 0 0 16px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
        }

        .card-link {
          color: #2563eb;
          font-size: 14px;
          font-weight: bold;
        }

        .recent-section {
          padding: 24px;
          border-radius: 12px;
          background: white;
          box-shadow: 0 3px 12px rgba(15, 23, 42, 0.06);
        }

        .recent-section h2 {
          margin: 0 0 20px;
          font-size: 21px;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .leave-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .leave-table th,
        .leave-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
          white-space: nowrap;
        }

        .leave-table th {
          background: #f8fafc;
          color: #475569;
        }

        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }

        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.approved {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .message {
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 8px;
          background: #fee2e2;
          color: #991b1b;
        }

        .empty-message {
          padding: 25px 10px;
          color: #64748b;
          text-align: center;
        }

        .view-all {
          display: inline-block;
          margin-top: 18px;
          color: #2563eb;
          font-weight: bold;
          text-decoration: none;
        }

        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .management-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .admin-dashboard {
            padding: 16px;
          }

          .stats-grid,
          .management-grid {
            grid-template-columns: 1fr;
          }

          .admin-header h1 {
            font-size: 24px;
          }

          .recent-section {
            padding: 16px;
          }
        }
      `}</style>

      <header className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Employee Leave Management Portal</p>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      {error && <div className="message">{error}</div>}

      <section className="stats-grid">
        <div className="stat-card">
          <p>Total Leave Applications</p>
          <h2>{loading ? "..." : leaves.length}</h2>
        </div>

        <div className="stat-card">
          <p>Pending Applications</p>
          <h2>{loading ? "..." : pendingLeaves}</h2>
        </div>

        <div className="stat-card">
          <p>Approved Applications</p>
          <h2>{loading ? "..." : approvedLeaves}</h2>
        </div>

        <div className="stat-card">
          <p>Rejected Applications</p>
          <h2>{loading ? "..." : rejectedLeaves}</h2>
        </div>
      </section>

      <section className="management-grid">
        <Link to="/manage-leaves" className="management-card">
          <div className="card-icon">📋</div>
          <h3>Manage Leave Requests</h3>
          <p>Review, approve, or reject applications.</p>
          <span className="card-link">
            View Requests &rarr;
          </span>
        </Link>

        <Link to="/manage-employees" className="management-card">
          <div className="card-icon">👥</div>
          <h3>Manage Employees</h3>
          <p>Add, edit, view, and delete employee records.</p>
          <span className="card-link">
            View Employees &rarr;
          </span>
        </Link>

        <Link to="/leave-reports" className="management-card">
          <div className="card-icon">📊</div>
          <h3>Leave Reports</h3>
          <p>View application totals and leave records.</p>
          <span className="card-link">
            View Reports &rarr;
          </span>
        </Link>
      </section>

      <section className="recent-section">
        <h2>Recent Leave Applications</h2>

        {loading ? (
          <p className="empty-message">
            Loading leave applications...
          </p>
        ) : leaves.length === 0 ? (
          <p className="empty-message">
            No leave applications found.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Leave ID</th>
                  <th>Employee ID</th>
                  <th>Leave Type</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Applied On</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {[...leaves]
                  .sort(
                    (a, b) =>
                      new Date(b.applicationDate || 0) -
                      new Date(a.applicationDate || 0)
                  )
                  .slice(0, 10)
                  .map((leave) => (
                    <tr key={leave._id || leave.leaveId}>
                      <td>{leave.leaveId || "-"}</td>
                      <td>{leave.employeeId || "-"}</td>
                      <td>{leave.leaveType || "-"}</td>
                      <td>{formatDate(leave.fromDate)}</td>
                      <td>{formatDate(leave.toDate)}</td>
                      <td>{formatDate(leave.applicationDate)}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            leave.leaveStatus
                          )}`}
                        >
                          {leave.leaveStatus || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        <Link to="/manage-leaves" className="view-all">
          View All Leave Requests &rarr;
        </Link>
      </section>
    </div>
  );
}

export default AdminDashboard;
