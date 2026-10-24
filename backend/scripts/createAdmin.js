
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");

const createAdmin = async () => {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error(
            "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env"
        );
    }

    if (ADMIN_PASSWORD.length < 12) {
        throw new Error(
            "ADMIN_PASSWORD must contain at least 12 characters"
        );
    }

    await connectDB();

    const email = ADMIN_EMAIL.trim().toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        if (existingUser.role === "admin") {
            console.log("Admin account already exists. No changes made.");
            return;
        }

        throw new Error(
            "This email already belongs to a non-admin account. " +
            "Choose a different ADMIN_EMAIL."
        );
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await User.create({
        userId: "ADM" + Date.now(),
        name: ADMIN_NAME.trim(),
        email,
        password: hashedPassword,
        role: "admin"
    });

    console.log("Admin account created successfully.");
    console.log("Admin email:", email);
};

createAdmin()
    .catch((error) => {
        console.error("Admin setup failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.connection.close();
    });
