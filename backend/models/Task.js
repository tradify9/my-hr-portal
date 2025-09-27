const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // 🔹 Kis admin ne banaya
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔹 Kis employee(s) ko assign hua
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // ensure always assigned to at least one employee
      },
    ],

    // 🔹 Task title
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },

    // 🔹 Task description
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // 🔹 Priority (default = Medium)
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    // 🔹 Task due date
    dueDate: {
      type: Date,
    },

    // 🔹 Current status
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt automatically add hoga
  }
);

// ✅ Indexing for faster queries (admin + employee wise)
taskSchema.index({ adminId: 1 });
taskSchema.index({ assignedTo: 1 });

module.exports = mongoose.model("Task", taskSchema);
