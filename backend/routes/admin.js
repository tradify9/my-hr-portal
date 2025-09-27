const express = require("express");
const protect = require("../middleware/authMiddleware");
const User = require("../models/User");
const upload = require("../middleware/upload"); // ✅ Multer middleware

// ✅ Import all admin controller methods
const {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  getAllLeaves,
  updateLeaveStatus,
  searchEmployees,
  getEmployeeSalarySlip,
} = require("../controllers/adminController");

const router = express.Router();

// ==========================
// ✅ Protect all admin routes
// ==========================
router.use(protect(["admin"]));

/**
 * ==========================
 * Admin Profile
 * ==========================
 */
router.get("/profile", async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select("-password -__v");

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({
        success: false,
        msg: "Admin not found",
      });
    }

    return res.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        company: admin.company || "No Company",
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("❌ Profile fetch error:", err.message);
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching profile",
    });
  }
});

/**
 * ==========================
 * Employee Management
 * ==========================
 */
router.get("/employees", getEmployees);
router.post("/employees", upload.single("image"), createEmployee);
router.put("/employees/:id", upload.single("image"), updateEmployee);
router.delete("/employees/:id", deleteEmployee);

/**
 * ==========================
 * Leave Management
 * ==========================
 */
router.get("/leaves", getAllLeaves);
router.put("/leaves/:id", updateLeaveStatus);

/**
 * ==========================
 * Employee Search & Salary Slip
 * ==========================
 */
router.get("/employees/search", searchEmployees);           // 🔍 Search employees
router.get("/employee/salary-slip", getEmployeeSalarySlip); // 🧾 Salary slip for employee

module.exports = router;
