
const jwt = require("jsonwebtoken");

// Verify JWT and identify the authenticated user
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access denied. Token required."
        });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is missing from environment configuration");

        return res.status(500).json({
            message: "Authentication configuration error"
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Validate required JWT fields
        if (
            !decoded.userId ||
            !["employee", "admin"].includes(decoded.role)
        ) {
            return res.status(401).json({
                message: "Invalid authentication token"
            });
        }

        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

// Allow only admin users
const verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access denied. Admin only."
        });
    }

    next();
};

// Allow only employee users
const verifyEmployee = (req, res, next) => {
    if (!req.user || req.user.role !== "employee") {
        return res.status(403).json({
            message: "Access denied. Employee only."
        });
    }

    next();
};

module.exports = {
    verifyToken,
    verifyAdmin,
    verifyEmployee
};
