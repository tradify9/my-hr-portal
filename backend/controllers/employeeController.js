const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const User = require("../models/User");

// ========================
// Punch In
// ========================
exports.punchIn = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res
        .status(401)
        .json({ success: false, allowed: false, msg: "Unauthorized - user not found" });
    }

    // Already punched in (not punched out yet)
    const existing = await Attendance.findOne({
      userId: req.user._id,
      punchOut: null,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        allowed: true,
        msg: "Already punched in. Please punch out first.",
      });
    }

    // ✅ Fix: take lat/lng directly
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        allowed: true,
        msg: "Location required",
      });
    }

    const attendance = await Attendance.create({
      userId: req.user._id,
      punchIn: new Date(),
      punchInLocation: { latitude, longitude }, // ✅ save location properly
    });

    return res.status(201).json({
      success: true,
      allowed: true,
      msg: "✅ Punched In successfully",
      attendance,
    });
  } catch (err) {
    console.error("❌ Punch In Error:", err);
    return res.status(500).json({
      success: false,
      allowed: true,
      msg: "Server error while punching in",
      error: err.message,
    });
  }
};

// ========================
// Punch Out
// ========================
exports.punchOut = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res
        .status(401)
        .json({ success: false, allowed: false, msg: "Unauthorized - user not found" });
    }

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      punchOut: null,
    }).sort({ punchIn: -1 });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        allowed: true,
        msg: "No active punch-in found",
      });
    }

    // ✅ Fix: take lat/lng directly
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        allowed: true,
        msg: "Location required",
      });
    }

    attendance.punchOut = new Date();
    attendance.punchOutLocation = { latitude, longitude }; // ✅ save location properly
    await attendance.save();

    return res.json({
      success: true,
      allowed: true,
      msg: "✅ Punched Out successfully",
      attendance,
    });
  } catch (err) {
    console.error("❌ Punch Out Error:", err);
    return res.status(500).json({
      success: false,
      allowed: true,
      msg: "Server error while punching out",
      error: err.message,
    });
  }
};

// ========================
// Get Attendance (Employee + Admin)
// ========================
exports.getAttendance = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        allowed: false,
        msg: "Unauthorized - user not found",
      });
    }

    // ✅ Employee → apna attendance
    if (req.user.role === "employee") {
      const records = await Attendance.find({ userId: req.user._id })
        .sort({ punchIn: -1 })
        .lean();

      return res.json({
        success: true,
        allowed: true,
        count: records.length,
        attendance: records,
      });
    }

    // ✅ Admin → apne employees ka attendance
    if (req.user.role === "admin") {
      const employees = await User.find({
        adminId: req.user._id,
        role: "employee", // 👈 sirf employees pick karna
      }).select("_id");

      const records = await Attendance.find({
        userId: { $in: employees.map((e) => e._id) },
      })
        .populate("userId", "name email")
        .sort({ punchIn: -1 })
        .lean();

      return res.json({
        success: true,
        allowed: true,
        count: records.length,
        attendance: records,
      });
    }

    // ❌ Agar koi aur role hai (superadmin/unauthorized)
    return res.status(403).json({
      success: false,
      allowed: false,
      msg: "Unauthorized role",
    });
  } catch (err) {
    console.error("❌ Get Attendance Error:", err);
    return res.status(500).json({
      success: false,
      allowed: true,
      msg: "Server error while fetching attendance",
      error: err.message,
    });
  }
};


// ========================
// Request Leave (Employee)
// ========================
exports.requestLeave = async (req, res) => {
  try {
    if (!req.user?._id || req.user.role !== "employee") {
      return res
        .status(401)
        .json({ success: false, allowed: false, msg: "Unauthorized - employee only" });
    }

    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason?.trim()) {
      return res.status(400).json({
        success: false,
        allowed: true,
        msg: "Start date, end date and reason are required",
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        allowed: true,
        msg: "End date must be after start date",
      });
    }

    if (!req.user.adminId) {
      return res.status(400).json({
        success: false,
        allowed: true,
        msg: "Employee is not linked to any admin",
      });
    }

    const leave = await Leave.create({
      userId: req.user._id,
      adminId: req.user.adminId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason.trim(),
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      allowed: true,
      msg: "✅ Leave request submitted successfully",
      leave,
    });
  } catch (err) {
    console.error("❌ Request Leave Error:", err);
    return res.status(500).json({
      success: false,
      allowed: true,
      msg: "Server error while requesting leave",
      error: err.message,
    });
  }
};

// ========================
// Get Leaves (Employee - self)
// ========================
exports.getLeaves = async (req, res) => {
  try {
    if (!req.user?._id || req.user.role !== "employee") {
      return res.status(401).json({
        success: false,
        allowed: false,
        msg: "Unauthorized - employee only",
      });
    }

    const leaves = await Leave.find({ userId: req.user._id })
      .populate("userId", "username name email")
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    return res.json({
      success: true,
      allowed: true,
      count: leaves.length,
      leaves,
    });
  } catch (err) {
    console.error("❌ Get Leaves Error:", err);
    return res.status(500).json({
      success: false,
      allowed: true,
      msg: "Server error while fetching leaves",
      error: err.message,
    });
  }
};

// ========================
// Get Leaves (Admin - own employees only)
// ========================
exports.getAdminLeaves = async (req, res) => {
  try {
    if (!req.user?._id || req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        allowed: false,
        msg: "Unauthorized - admin only",
      });
    }

    const leaves = await Leave.find({ adminId: req.user._id })
      .populate("userId", "name username email role")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      allowed: true,
      count: leaves?.length || 0,
      leaves: leaves || [],
    });
  } catch (err) {
    console.error("❌ Get Admin Leaves Error:", err);
    return res.status(500).json({
      success: false,
      allowed: true,
      msg: "Server error while fetching admin leaves",
      error: err.message,
    });
  }
};


