
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import API_URL from "../api";

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

    // Safely handle JSON and HTML responses
    const readResponse = async (response) => {
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            return await response.json();
        }

        const text = await response.text();

        if (!response.ok) {
            throw new Error(
                `Server returned HTTP ${response.status}. Check the API URL and backend route.`
            );
        }

        throw new Error(
            "The server returned HTML instead of JSON. Check the profile API route."
        );
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                setError("");

                const response = await fetch(
                    `${API_URL}/api/employees/me`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await readResponse(response);

                if (response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load profile."
                    );
                }

                // Supports either a direct employee object or { employee: {...} }
                const employee = data.employee || data;

                setProfile({
                    employeeId: employee.employeeId || "",
                    employeeName: employee.employeeName || "",
                    department: employee.department || "",
                    designation: employee.designation || "",
                    email: employee.email || "",
                    mobile: employee.mobile || ""
                });
            } catch (err) {
                console.error("Profile loading error:", err);
                setError(err.message || "Unable to load your profile.");
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

        if (
            !profile.employeeName.trim() ||
            !profile.department.trim() ||
            !profile.designation.trim() ||
            !profile.mobile.trim()
        ) {
            setError("Please complete all required fields.");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                `${API_URL}/api/employees/me`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        employeeName: profile.employeeName.trim(),
                        department: profile.department.trim(),
                        designation: profile.designation.trim(),
                        mobile: profile.mobile.trim()
                    })
                }
            );

            const data = await readResponse(response);

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update profile."
                );
            }

            const employee = data.employee || data;

            setProfile((previousProfile) => ({
                ...previousProfile,
                employeeId: employee.employeeId || previousProfile.employeeId,
                employeeName: employee.employeeName || previousProfile.employeeName,
                department: employee.department || previousProfile.department,
                designation: employee.designation || previousProfile.designation,
                email: employee.email || previousProfile.email,
                mobile: employee.mobile || previousProfile.mobile
            }));

            setSuccess(data.message || "Profile updated successfully.");
        } catch (err) {
            console.error("Profile update error:", err);
            setError(err.message || "Unable to update your profile.");
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
                    &larr; Back to Dashboard
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
