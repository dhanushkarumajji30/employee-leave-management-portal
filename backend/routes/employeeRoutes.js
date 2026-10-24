
const express = require("express");

const {
    getEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getMyProfile,
    updateMyProfile
} = require("../controllers/employeeController");

const {
    verifyToken,
    verifyAdmin,
    verifyEmployee
} = require("../middleware/authMiddleware");

const router = express.Router();

// Employee-specific profile routes.
// Keep /me routes BEFORE /:id routes.
router.get("/me", verifyToken, verifyEmployee, getMyProfile);
router.put("/me", verifyToken, verifyEmployee, updateMyProfile);

// Admin-only employee management routes
router.get("/", verifyToken, verifyAdmin, getEmployees);
router.post("/", verifyToken, verifyAdmin, addEmployee);
router.put("/:id", verifyToken, verifyAdmin, updateEmployee);
router.delete("/:id", verifyToken, verifyAdmin, deleteEmployee);

module.exports = router;
