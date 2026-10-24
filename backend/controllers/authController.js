
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Employee Registration
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters"
            });
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            });
        }

        // Check whether the email already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a login account
        const user = await User.create({
            userId: "EMP" + Date.now(),
            name: normalizedName,
            email: normalizedEmail,
            password: hashedPassword,
            role: "employee"
        });

        return res.status(201).json({
            message: "Employee registered successfully",
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Registration error:", error.message);

        // Handle duplicate email or user ID
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email or employee account ID already exists"
            });
        }

        return res.status(500).json({
            message: "Server error during registration"
        });
    }
};

// Employee/Admin Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        // Use the same error message for unknown email and wrong password
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!user.userId || !user.role) {
            return res.status(500).json({
                message: "User account configuration is incomplete"
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from environment configuration");

            return res.status(500).json({
                message: "Authentication configuration error"
            });
        }

        // Create a JWT containing the account ID and role
        const token = jwt.sign(
            {
                userId: user.userId,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Server error during login"
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};
