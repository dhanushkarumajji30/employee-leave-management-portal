
const Employee = require("../models/Employee");
const User = require("../models/User");

// GET: View all employees (Admin only)
const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });

        return res.status(200).json(employees);
    } catch (error) {
        console.error("Get employees error:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve employees"
        });
    }
};

// GET: View the logged-in employee's own profile
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findOne({
            userId: req.user.userId
        }).select("email");

        if (!user) {
            return res.status(404).json({
                message: "User account not found"
            });
        }

        const employee = await Employee.findOne({
            email: user.email
        });

        if (!employee) {
            return res.status(404).json({
                message: "Employee profile not found. Please contact the administrator to link your employee record."
            });
        }

        return res.status(200).json(employee);
    } catch (error) {
        console.error("Get own profile error:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve your profile"
        });
    }
};

// PUT: Update the logged-in employee's own profile
const updateMyProfile = async (req, res) => {
    try {
        const user = await User.findOne({
            userId: req.user.userId
        }).select("email");

        if (!user) {
            return res.status(404).json({
                message: "User account not found"
            });
        }

        const employee = await Employee.findOne({
            email: user.email
        });

        if (!employee) {
            return res.status(404).json({
                message: "Employee profile not found. Please contact the administrator."
            });
        }

        // Employees may update only these fields.
        const allowedFields = [
            "employeeName",
            "department",
            "designation",
            "mobile"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                if (
                    typeof req.body[field] !== "string" ||
                    !req.body[field].trim()
                ) {
                    return res.status(400).json({
                        message: `${field} must be a non-empty string`
                    });
                }

                updates[field] = req.body[field].trim();
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Provide at least one valid profile field to update"
            });
        }

        const updatedEmployee = await Employee.findOneAndUpdate(
            { email: user.email },
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            message: "Profile updated successfully",
            employee: updatedEmployee
        });
    } catch (error) {
        console.error("Update own profile error:", error.message);

        return res.status(500).json({
            message: "Failed to update your profile"
        });
    }
};

// POST: Add an employee (Admin only)
const addEmployee = async (req, res) => {
    try {
        const {
            employeeId,
            employeeName,
            department,
            designation,
            email,
            mobile
        } = req.body;

        if (
            !employeeId ||
            !employeeName ||
            !department ||
            !designation ||
            !email ||
            !mobile
        ) {
            return res.status(400).json({
                message: "All employee fields are required"
            });
        }

        const employee = await Employee.create({
            employeeId,
            employeeName,
            department,
            designation,
            email,
            mobile
        });

        return res.status(201).json({
            message: "Employee added successfully",
            employee
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Employee ID or email already exists"
            });
        }

        console.error("Add employee error:", error.message);

        return res.status(500).json({
            message: "Failed to add employee"
        });
    }
};

// PUT: Update an employee by MongoDB document ID (Admin only)
const updateEmployee = async (req, res) => {
    try {
        const {
            employeeId,
            employeeName,
            department,
            designation,
            email,
            mobile
        } = req.body;

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            {
                employeeId,
                employeeName,
                department,
                designation,
                email,
                mobile
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        return res.status(200).json({
            message: "Employee updated successfully",
            employee
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Employee ID or email already exists"
            });
        }

        console.error("Update employee error:", error.message);

        return res.status(400).json({
            message: "Failed to update employee"
        });
    }
};

// DELETE: Delete an employee by MongoDB document ID (Admin only)
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        return res.status(200).json({
            message: "Employee deleted successfully"
        });
    } catch (error) {
        console.error("Delete employee error:", error.message);

        return res.status(400).json({
            message: "Failed to delete employee"
        });
    }
};

module.exports = {
    getEmployees,
    getMyProfile,
    updateMyProfile,
    addEmployee,
    updateEmployee,
    deleteEmployee
};
