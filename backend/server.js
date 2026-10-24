const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const app = express();
const leaveRoutes = require("./routes/leaveRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/employees", employeeRoutes);
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/leaveApplications", leaveRoutes);
app.get("/", (req, res) => {
    res.send("Employee Leave Management Portal Backend is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});