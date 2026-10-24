
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

const API_URL = "http://localhost:5000/api";

function Profile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        employeeId: "",
        employeeName: "",
        department: "",
        designation: "",
        email: "",
        mobile: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/employees/me`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load profile"
                    );
                }

                setProfile({
                    employeeId: data.employeeId || "",
                    employeeName: data.employeeName || "",
                    department: data.department || "",
                    designation: data.designation || "",
                    email: data.email || "",
                    mobile: data.mobile || ""
                });
            } catch (err) {
                setError(err.message || "Unable to connect to the server");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setProfile((previousProfile) => ({
            ...previousProfile,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        if (!profile.employeeName.trim() || !profile.mobile.trim()) {
            setError("Employee name and mobile number are required.");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(`${API_URL}/employees/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    employeeName: profile.employeeName,
                    department: profile.department,
                    designation: profile.designation,
                    mobile: profile.mobile
                })
            });

            const data = await response.json();

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            if (data.employee) {
                setProfile((previousProfile) => ({
                    ...previousProfile,
                    ...data.employee
                }));
            }

            setSuccess(data.message || "Profile updated successfully.");
        } catch (err) {
            setError(err.message || "Unable to connect to the server");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div className="auth-brand">
                    <div className="brand-icon">EL</div>
                    <div>
                        <h2>Employee Leave Portal</h2>
                        <p>Manage your employee profile</p>
                    </div>
                </div>

                <Link to="/employee-dashboard" className="btn btn-outline">
                    Back to Dashboard
                </Link>
            </header>

            <main className="leave-form-container">
                <div className="leave-form-heading">
                    <p className="dashboard-eyebrow">MY ACCOUNT</p>
                    <h1>My Profile</h1>
                    <p>View and update your employee information.</p>
                </div>

                <section className="dashboard-panel">
                    {error && <p className="form-error">{error}</p>}
                    {success && <p className="form-success">{success}</p>}

                    {!profile.employeeId && !error && (
                        <p className="form-error">
                            Your employee profile could not be identified.
                        </p>
                    )}

                    <form className="leave-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="employeeId">Employee ID</label>
                            <input
                                id="employeeId"
                                name="employeeId"
                                value={profile.employeeId}
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="employeeName">Full Name</label>
                            <input
                                id="employeeName"
                                name="employeeName"
                                value={profile.employeeName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={profile.email}
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="department">Department</label>
                            <input
                                id="department"
                                name="department"
                                value={profile.department}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="designation">Designation</label>
                            <input
                                id="designation"
                                name="designation"
                                value={profile.designation}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="mobile">Mobile Number</label>
                            <input
                                id="mobile"
                                name="mobile"
                                type="tel"
                                value={profile.mobile}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary leave-submit"
                            disabled={saving || !profile.employeeId}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default Profile;
