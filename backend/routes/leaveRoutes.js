
const express = require("express");

const {
    applyLeave,
    getLeaveApplications,
    updateLeaveStatus,
    deleteLeaveApplication
} = require("../controllers/leaveController");

const {
    verifyToken,
    verifyAdmin
} = require("../middleware/authMiddleware");

const router = express.Router();

// Employees can view their own applications.
// Admins can view all applications.
router.get("/", verifyToken, getLeaveApplications);

// Only employees can submit leave applications.
// The controller also verifies the role.
router.post("/", verifyToken, applyLeave);

// Only admins can approve or reject leave applications.
router.put(
    "/:id",
    verifyToken,
    verifyAdmin,
    updateLeaveStatus
);

// Only admins can delete leave applications.
router.delete(
    "/:id",
    verifyToken,
    verifyAdmin,
    deleteLeaveApplication
);

module.exports = router;
