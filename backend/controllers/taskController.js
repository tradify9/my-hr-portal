const Task = require("../models/Task");
const User = require("../models/User");

// ============================================
// ✅ Admin creates a task (assign only to their employees)
// ============================================
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, msg: "⚠️ Title is required" });
    }

    // ✅ Only employees of this logged-in admin
    const employees = await User.find({
      adminId: req.user._id,
      role: "employee",
    }).select("_id");

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "⚠️ No employees found under this admin",
      });
    }

    const task = await Task.create({
      adminId: req.user._id,
      assignedTo: employees.map((e) => e._id),
      title,
      description,
      dueDate,
      priority,
    });

    res.json({
      success: true,
      msg: "✅ Task assigned to all employees under this admin",
      task,
    });
  } catch (err) {
    console.error("❌ Create Task Error:", err.message);
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};

// ============================================
// ✅ Employee: Get only my tasks
// ============================================
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("adminId", "name email"); // optional: show admin details

    res.json({ success: true, tasks });
  } catch (err) {
    console.error("❌ Get My Tasks Error:", err.message);
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};

// ============================================
// ✅ Admin: Get all tasks created by me
// ============================================
exports.getAdminTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ adminId: req.user._id })
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (err) {
    console.error("❌ Get Admin Tasks Error:", err.message);
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};

// ============================================
// ✅ Employee: Update only my own task status
// ============================================
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, msg: "⚠️ Invalid status value" });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, assignedTo: req.user._id }, // ✅ fixed param name
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        msg: "⚠️ Task not found or not assigned to you",
      });
    }

    res.json({ success: true, msg: "✅ Task status updated", task });
  } catch (err) {
    console.error("❌ Update Task Status Error:", err.message);
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};
