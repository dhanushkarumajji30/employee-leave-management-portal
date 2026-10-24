
const LeaveApplication = require("../models/LeaveApplication");
const User = require("../models/User");
const Employee = require("../models/Employee");

// Generate a unique leave ID
const generateLeaveId = () => {
    return "LEV" + Date.now() + Math.floor(Math.random() * 1000);
};

// Find the employee record belonging to the authenticated user
const getEmployeeForUser = async (userId) => {
    const user = await User.findOne({ userId }).select("email");

    if (!user) {
        return null;
    }

    const employee = await Employee.findOne({
        email: user.email
    }).select("employeeId");

    return employee;
};

// POST: Apply for leave (employees only)
const applyLeave = async (req, res) => {
    try {
        const { leaveType, fromDate, toDate, reason } = req.body;

        // Confirm authentication
        if (!req.user || !req.user.userId || !req.user.role) {
            return res.status(401).json({
                message: "Please log in before applying for leave"
            });
        }

        // Only employees can apply for leave
        if (req.user.role !== "employee") {
            return res.status(403).json({
                message: "Only employees can apply for leave"
            });
        }

        // Validate required fields
        if (!leaveType || !fromDate || !toDate || !reason) {
            return res.status(400).json({
                message: "Leave type, dates and reason are required"
            });
        }

        // Validate leave type
        const validLeaveTypes = ["CL", "SL", "EL", "OD"];

        if (!validLeaveTypes.includes(leaveType)) {
            return res.status(400).json({
                message: "Invalid leave type. Use CL, SL, EL or OD"
            });
        }

        // Validate dates
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {
            return res.status(400).json({
                message: "Please provide valid leave dates"
            });
        }

        if (endDate < startDate) {
            return res.status(400).json({
                message: "End date cannot be before start date"
            });
        }

        // Validate reason
        if (
            typeof reason !== "string" ||
            reason.trim().length === 0
        ) {
            return res.status(400).json({
                message: "Reason cannot be empty"
            });
        }

        // Find the employee associated with this login account
        const employee = await getEmployeeForUser(req.user.userId);

        if (!employee) {
            return res.status(404).json({
                message:
                    "Employee record not found. Please contact the admin."
            });
        }

        // Create the leave application using the actual employeeId
        const leave = await LeaveApplication.create({
            leaveId: generateLeaveId(),
            employeeId: employee.employeeId,
            leaveType,
            fromDate: startDate,
            toDate: endDate,
            reason: reason.trim(),
            applicationDate: new Date(),
            leaveStatus: "Pending"
        });

        return res.status(201).json({
            message: "Leave application submitted successfully",
            leave
        });
    } catch (error) {
        console.error("Apply leave error:", error.message);

        return res.status(500).json({
            message: "Failed to submit leave application"
        });
    }
};

// GET: View leave applications
const getLeaveApplications = async (req, res) => {
    try {
        if (!req.user || !req.user.userId || !req.user.role) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        let filter = {};

        if (req.user.role === "employee") {
            // Employees can see only their own applications
            const employee = await getEmployeeForUser(req.user.userId);

            if (!employee) {
                return res.status(404).json({
                    message: "Employee record not found"
                });
            }

            filter.employeeId = employee.employeeId;
        } else if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to view leave applications"
            });
        }

        // Admins can view all applications
        const leaves = await LeaveApplication.find(filter)
            .sort({ applicationDate: -1 });

        return res.status(200).json(leaves);
    } catch (error) {
        console.error("Get leaves error:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve leave applications"
        });
    }
};

// PUT: Approve or reject a leave application (admin only)
const updateLeaveStatus = async (req, res) => {
    try {
        if (!req.user || !req.user.userId || req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only admins can update leave status"
            });
        }

        const { leaveStatus } = req.body;

        if (!["Approved", "Rejected"].includes(leaveStatus)) {
            return res.status(400).json({
                message: "Status must be Approved or Rejected"
            });
        }

        const leave = await LeaveApplication.findByIdAndUpdate(
            req.params.id,
            { $set: { leaveStatus } },
            {
                new: true,
                runValidators: true
            }
        );

        if (!leave) {
            return res.status(404).json({
                message: "Leave application not found"
            });
        }

        return res.status(200).json({
            message: `Leave application ${leaveStatus.toLowerCase()} successfully`,
            leave
        });
    } catch (error) {
        console.error("Update leave status error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid leave application ID"
            });
        }

        return res.status(500).json({
            message: "Failed to update leave status"
        });
    }
};

// DELETE: Delete a leave application (admin only)
const deleteLeaveApplication = async (req, res) => {
    try {
        if (!req.user || !req.user.userId || req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only admins can delete leave applications"
            });
        }

        const leave = await LeaveApplication.findByIdAndDelete(
            req.params.id
        );

        if (!leave) {
            return res.status(404).json({
                message: "Leave application not found"
            });
        }

        return res.status(200).json({
            message: "Leave application deleted successfully"
        });
    } catch (error) {
        console.error("Delete leave error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid leave application ID"
            });
        }

        return res.status(500).json({
            message: "Failed to delete leave application"
        });
    }
};

module.exports = {
    applyLeave,
    getLeaveApplications,
    updateLeaveStatus,
    deleteLeaveApplication
};
