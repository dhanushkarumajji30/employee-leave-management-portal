
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from .env");
        }

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000
        });

        console.log("MongoDB connected successfully");
        console.log("Connected database:", mongoose.connection.name);

    } catch (error) {
        console.error("MongoDB connection failed!");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);

        if (error.reason) {
            console.error("Connection reason:", error.reason);
        }

        process.exit(1);
    }
};

module.exports = connectDB;
