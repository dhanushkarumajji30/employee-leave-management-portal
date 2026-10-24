
const mongoose = require("mongoose");

const leaveApplicationSchema = new mongoose.Schema(
    {
        leaveId: {
            type: String,
            unique: true,
            trim: true
        },

        employeeId: {
            type: String,
            required: true,
            trim: true
        },

        leaveType: {
            type: String,
            required: true,
            enum: ["CL", "SL", "EL", "OD"]
        },

        fromDate: {
            type: Date,
            required: true
        },

        toDate: {
            type: Date,
            required: true
        },

        reason: {
            type: String,
            required: true,
            trim: true
        },

        applicationDate: {
            type: Date,
            default: Date.now
        },

        leaveStatus: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

// Ensure the end date is not before the start date.
leaveApplicationSchema.pre("validate", function () {
    if (
        this.fromDate &&
        this.toDate &&
        this.toDate < this.fromDate
    ) {
        this.invalidate(
            "toDate",
            "End date cannot be before start date"
        );
    }
});

module.exports = mongoose.model(
    "LeaveApplication",
    leaveApplicationSchema
);
