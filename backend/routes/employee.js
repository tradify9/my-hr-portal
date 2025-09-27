const express = require("express");
const {
  punchIn,
  punchOut,
  requestLeave,
  getLeaves,
  getAttendance,
    // ✅ नया salary slip controller
} = require("../controllers/employeeController");
const protect = require("../middleware/authMiddleware");
const User = require("../models/User");


const path = require("path");

const router = express.Router();

/**
 * ===========================
 * Verify Employee Access
 * ===========================
 */
router.get("/verify-access", protect(["employee"]), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("role adminId");

    if (!user || user.role !== "employee") {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized",
      });
    }

    return res.json({
      success: true,
      role: user.role,
      adminId: user.adminId || null,
    });
  } catch (err) {
    console.error("❌ Verify access error:", err.message);
    return res.status(500).json({
      success: false,
      msg: "Server error while verifying access",
      error: err.message,
    });
  }
});

/**
 * ===========================
 * Employee Profile
 * ===========================
 */
router.get("/me", protect(["employee"]), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "Employee not found",
      });
    }

    console.log("🔍 Raw user.image from DB:", user.image);

    let imageUrl = null;
    if (user.image) {
      imageUrl = `/uploads/${path.basename(user.image)}`;
      console.log("✅ Final imageUrl returned:", imageUrl);
    }

    const payload = {
      success: true,
      role: user.role,
      adminId: user.adminId || null,
      user: {
        ...user.toObject(),
        image: imageUrl,
      },
    };

    console.log("📤 API Response /me:", payload);

    return res.json(payload);
  } catch (err) {
    console.error("❌ Employee profile fetch error:", err.message);
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching profile",
      error: err.message,
    });
  }
});

/**
 * ===========================
 * Attendance Routes
 * ===========================
 */
router.post("/punch-in", protect(["employee"]), punchIn);
router.post("/punch-out", protect(["employee"]), punchOut);
router.get("/attendance", protect(["employee", "admin"]), getAttendance);

/**
 * ===========================
 * Leave Routes
 * ===========================
 */
router.post("/leaves", protect(["employee"]), requestLeave);
router.get("/leaves", protect(["employee"]), getLeaves);



module.exports = router;
