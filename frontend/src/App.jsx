
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'
import EmployeeDashboard from './pages/EmployeeDashboard'
import ApplyLeave from './pages/ApplyLeave'
import LeaveHistory from './pages/LeaveHistory'
import AdminDashboard from './pages/AdminDashboard'
import ManageLeaves from './pages/ManageLeaves'
import Profile from './pages/Profile'
import ManageEmployees from './pages/ManageEmployees'
import LeaveReports from './pages/LeaveReports'

// Home Page
function Home() {
  return (
    <div className="app">
      <header className="navbar">
        <Link to="/" className="brand">
          <span className="brand-icon">EL</span>
          <span>
            <strong>LeavePortal</strong>
            <small>Employee Leave Management</small>
          </span>
        </Link>

        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="btn btn-outline">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-content">
            <span className="eyebrow">
              SIMPLE Â· SMART Â· ORGANIZED
            </span>

            <h1>
              Leave management,
              <br />
              <span>made simple.</span>
            </h1>

            <p className="hero-description">
              Apply for leave, track your applications, and stay
              updated on approvals â€” all in one convenient portal.
            </p>

            <div className="hero-actions">
              <Link
                to="/register"
                className="btn btn-primary btn-large"
              >
                Get Started <span aria-hidden="true">â†’</span>
              </Link>

              <Link
                to="/login"
                className="btn btn-light btn-large"
              >
                Sign In
              </Link>
            </div>

            <div className="hero-note">
              <span className="check-icon">âœ“</span>
              Easy applications. Clear status. Less paperwork.
            </div>
          </div>

          <div className="hero-visual">
            <div className="dashboard-card">
              <div className="card-heading">
                <div>
                  <span className="muted-label">
                    EMPLOYEE PORTAL
                  </span>
                  <h2>Leave Overview</h2>
                </div>

                <div className="calendar-icon">â–¦</div>
              </div>

              <div className="summary-grid">
                <div className="summary-box">
                  <span className="summary-icon blue">â–¤</span>
                  <p>Total Requests</p>
                  <h3>08</h3>
                </div>

                <div className="summary-box">
                  <span className="summary-icon orange">â—·</span>
                  <p>Pending</p>
                  <h3>02</h3>
                </div>

                <div className="summary-box">
                  <span className="summary-icon green">âœ“</span>
                  <p>Approved</p>
                  <h3>05</h3>
                </div>
              </div>

              <div className="recent-heading">
                <h3>Recent Applications</h3>
                <span>Sample preview</span>
              </div>

              <div className="leave-row">
                <div className="leave-type-icon">CL</div>

                <div className="leave-details">
                  <strong>Casual Leave</strong>
                  <span>Nov 10 â€“ Nov 11</span>
                </div>

                <span className="status status-approved">
                  Approved
                </span>
              </div>

              <div className="leave-row">
                <div className="leave-type-icon sick">SL</div>

                <div className="leave-details">
                  <strong>Sick Leave</strong>
                  <span>Nov 16 â€“ Nov 17</span>
                </div>

                <span className="status status-pending">
                  Pending
                </span>
              </div>

              <div className="preview-note">
                Dashboard preview â€” sample data only
              </div>
            </div>

            <div className="floating-badge">
              <span className="floating-check">âœ“</span>
              <span>
                <strong>Stay informed</strong>
                <small>Track every request</small>
              </span>
            </div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <span className="eyebrow">WHAT YOU CAN DO</span>

            <h2>Everything you need in one place</h2>

            <p>
              A straightforward way for employees and administrators
              to manage leave requests.
            </p>
          </div>

          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon purple">âœŽ</div>
              <h3>Apply for Leave</h3>
              <p>
                Submit leave requests online with dates, leave type,
                and reason.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon blue">â–¤</div>
              <h3>Track Applications</h3>
              <p>
                Check your leave history and see whether requests
                are pending, approved, or rejected.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon green">âœ“</div>
              <h3>Manage Approvals</h3>
              <p>
                Administrators can review applications and approve
                or reject requests.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon orange">â™™</div>
              <h3>Employee Records</h3>
              <p>
                Keep employee details organized and access leave
                information in one place.
              </p>
            </article>
          </div>
        </section>

        <section
          className="workflow-section"
          id="how-it-works"
        >
          <div className="section-heading">
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>Three simple steps</h2>
            <p>
              From submitting a request to receiving a decision.
            </p>
          </div>

          <div className="workflow-grid">
            <article className="workflow-step">
              <span className="step-number">01</span>
              <h3>Sign in</h3>
              <p>
                Log in with your account to access your dashboard.
              </p>
            </article>

            <article className="workflow-step">
              <span className="step-number">02</span>
              <h3>Apply for leave</h3>
              <p>
                Enter the leave dates, select a type, and submit.
              </p>
            </article>

            <article className="workflow-step">
              <span className="step-number">03</span>
              <h3>Track the status</h3>
              <p>
                View the decision after an administrator reviews it.
              </p>
            </article>
          </div>
        </section>

        <section className="cta-section">
          <div>
            <h2>Ready to get started?</h2>
            <p>
              Access your leave management portal today.
            </p>
          </div>

          <Link
            to="/register"
            className="btn btn-white btn-large"
          >
            Create Account â†’
          </Link>
        </section>
      </main>

      <footer className="footer">
        <Link to="/" className="footer-brand">
          LeavePortal
        </Link>

        <p>Employee Leave Management Portal</p>

        <span>
          Built for simple and organized leave management.
        </span>
      </footer>
    </div>
  )
}

// Main Application and Routes
function App() {
  return (
    <Routes>
      {/* Open Login directly when the website is visited */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/employee-dashboard"
        element={<EmployeeDashboard />}
      />

      <Route path="/apply-leave" element={<ApplyLeave />} />
      <Route path="/leave-history" element={<LeaveHistory />} />
      <Route path="/profile" element={<Profile />} />

      <Route
        path="/admin-dashboard"
        element={<AdminDashboard />}
      />

      <Route path="/manage-leaves" element={<ManageLeaves />} />
      <Route
        path="/manage-employees"
        element={<ManageEmployees />}
      />
      <Route path="/leave-reports" element={<LeaveReports />} />

      <Route
        path="*"
        element={
          <main className="auth-page">
            <section className="auth-card">
              <h1>Page not found</h1>

              <p className="auth-subtitle">
                The page you are looking for does not exist.
              </p>

              <Link to="/login" className="btn btn-primary">
                Back to Login
              </Link>
            </section>
          </main>
        }
      />
    </Routes>
  )
}

export default App


