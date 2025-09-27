const User = require("../models/User");
const Leave = require("../models/Leave");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");

exports.createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      department,
      position,
      salary,
      joinDate,
      password,
    } = req.body;

    console.log("👉 Employee Create Body:", req.body);

    // -------------------- Validation --------------------
    if (
      !employeeId ||
      !name ||
      !email ||
      !department ||
      !position ||
      !salary ||
      !joinDate ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        msg: "All fields are required (including department, join date, and password)",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Duplicate check
    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { employeeId }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        msg: "Email or EmployeeID already in use",
      });
    }

    // -------------------- Generate Username --------------------
    let baseUsername = name.toLowerCase().replace(/\s+/g, "");
    let generatedUsername = baseUsername;
    let counter = 1;
    while (await User.findOne({ username: generatedUsername })) {
      generatedUsername = `${baseUsername}${counter++}`;
      if (counter > 1000) break;
    }

    // -------------------- Handle Uploaded Image --------------------
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // -------------------- Create Employee --------------------
    const employee = new User({
      employeeId,
      name,
      email: normalizedEmail,
      department,
      position,
      salary,
      joinDate,
      password: password.toString().trim(), // 👈 plain password, schema will hash
      username: generatedUsername,
      role: "employee",
      adminId: req.user._id,
      image: imagePath,
    });

    await employee.save();
    console.log("✅ Employee created with username:", employee.username);

    // -------------------- Send Email --------------------
    try {
      const emailContent = `
        <h2>Welcome, ${name}!</h2>
        <p>Your employee account has been created successfully. Here are your details:</p>
        <ul>
          <li><b>Employee ID:</b> ${employeeId}</li>
          <li><b>Name:</b> ${name}</li>
          <li><b>Email:</b> ${normalizedEmail}</li>
          <li><b>Username:</b> ${generatedUsername}</li>
          <li><b>Department:</b> ${department}</li>
          <li><b>Position:</b> ${position}</li>
          <li><b>Salary:</b> ₹${salary}</li>
          <li><b>Join Date:</b> ${new Date(joinDate).toDateString()}</li>
          <li><b>Password:</b> ${password}</li>
        </ul>
        <p>Please login and change your password after first login.</p>
      `;
      await sendEmail(normalizedEmail, "Your Employee Account Details", emailContent);
    } catch (emailErr) {
      console.warn("⚠️ Email send failed:", emailErr.message);
    }

    return res.status(201).json({ success: true, employee });
  } catch (err) {
    console.error("❌ Create Employee Error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error while creating employee",
      error: err.message,
    });
  }
};


/**
 * =============================
 * Get Employees
 * =============================
 */
exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      role: "employee",
      adminId: req.user.id,
    }).select("-__v -password");

    return res.json({ success: true, employees });
  } catch (err) {
    console.error("❌ Get Employees Error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching employees",
      error: err.message,
    });
  }
};



/**
 * ==========================
 * Get Admin Profile
 * ==========================
 */
exports.getAdminProfile = async (req, res) => {
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
};

/**
 * =============================
 * Update Employee
 * =============================
 */
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim();

      // ✅ check duplicate email
      const emailExists = await User.findOne({
        email: updates.email,
        _id: { $ne: id },
      });
      if (emailExists) {
        return res
          .status(400)
          .json({ success: false, msg: "Email already in use" });
      }
    }

    // ✅ username regenerate if name changed
    if (updates.name) {
      let baseUsername = updates.name.toLowerCase().replace(/\s+/g, "");
      let generatedUsername = baseUsername;
      let counter = 1;
      while (
        await User.findOne({
          username: generatedUsername,
          _id: { $ne: id },
        })
      ) {
        generatedUsername = `${baseUsername}${counter++}`;
        if (counter > 1000) break; // safety break
      }
      updates.username = generatedUsername;
    }

    // ✅ optional password update
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    } else {
      delete updates.password;
    }

    const employee = await User.findOneAndUpdate(
      { _id: id, adminId: req.user.id, role: "employee" },
      updates,
      { new: true, runValidators: true }
    ).select("-__v -password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        msg: "Employee not found or not authorized",
      });
    }

    // ✅ Send update email
    try {
      const emailContent = `
        <h2>Hello, ${employee.name}</h2>
        <p>Your employee details have been updated:</p>
        <ul>
          <li><b>Name:</b> ${employee.name}</li>
          <li><b>Email:</b> ${employee.email}</li>
          <li><b>Position:</b> ${employee.position}</li>
          <li><b>Salary:</b> ₹${employee.salary}</li>
          ${
            req.body.password
              ? `<li><b>New Password:</b> ${req.body.password}</li>`
              : ""
          }
        </ul>
        <p>If you did not request these changes, please contact admin.</p>
      `;
      await sendEmail(
        employee.email,
        "Your Employee Details Updated",
        emailContent
      );
    } catch (emailErr) {
      console.warn("⚠️ Email send failed:", emailErr.message);
    }

    return res.json({ success: true, employee });
  } catch (err) {
    console.error("❌ Update Employee Error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error while updating employee",
      error: err.message,
    });
  }
};

/**
 * =============================
 * Delete Employee
 * =============================
 */
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await User.findOneAndDelete({
      _id: id,
      adminId: req.user.id,
      role: "employee",
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        msg: "Employee not found or not authorized",
      });
    }

    return res.json({
      success: true,
      msg: `✅ Employee '${employee.name}' deleted successfully`,
      employee,
    });
  } catch (err) {
    console.error("❌ Delete Employee Error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error while deleting employee",
      error: err.message,
    });
  }
};

/**
 * =============================
 * Get All Leaves (Admin-Specific)
 * =============================
 */
exports.getAllLeaves = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, msg: "Access denied. Admins only." });
    }

    const employees = await User.find({ adminId: req.user.id }, "_id");
    const employeeIds = employees.map((emp) => emp._id);

    const leaves = await Leave.find({ userId: { $in: employeeIds } })
      .populate("userId", "name email employeeId username")
      .sort({ createdAt: -1 });

    return res.json({ success: true, leaves });
  } catch (err) {
    console.error("❌ Get All Leaves Error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching leaves",
      error: err.message,
    });
  }
};

/**
 * =============================
 * Update Leave Status (Admin)
 * =============================
 */
exports.updateLeaveStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, msg: "Access denied. Admins only." });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, msg: "Invalid status" });
    }

    const leave = await Leave.findById(id).populate(
      "userId",
      "name email employeeId username adminId"
    );

    if (!leave) {
      return res.status(404).json({ success: false, msg: "Leave not found" });
    }

    if (String(leave.userId.adminId) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        msg: "Not authorized to update this leave",
      });
    }

    leave.status = status;
    await leave.save();

    return res.json({ success: true, leave });
  } catch (err) {
    console.error("❌ Update Leave Status Error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error while updating leave status",
      error: err.message,
    });
  }
};







// ==============================
// 🔍 Admin - Search Employees
// ==============================
exports.searchEmployees = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { q } = req.query;

    console.log("🔍 Search Employees API called:", { adminId, q });

    if (!q) {
      return res
        .status(400)
        .json({ success: false, msg: "Search query required" });
    }

    // ✅ Fetch admin for fallback company
    const admin = await User.findById(adminId).select("company");

    const employees = await User.find({
      adminId,
      role: "employee",
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { employeeId: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } }, // search by employee's own company if set
      ],
    }).select("name email employeeId department position company salary joinDate");

    console.log("📦 Employees Found:", employees.length);

    const employeesWithCompany = employees.map((emp) => {
      const empObj = emp.toObject();
      return {
        ...empObj,
        companyName: empObj.company || admin.company || "No Company",
      };
    });

    console.log("✅ Employees with Company Name:", employeesWithCompany);

    return res.json({ success: true, employees: employeesWithCompany });
  } catch (err) {
    console.error("❌ Search Employees Error:", err);
    return res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};

// =======================================
// 🧾 Admin - Get Employee Salary Slip
// =======================================
exports.getEmployeeSalarySlip = async (req, res) => {
  try {
    const { from, to, employeeId } = req.query;

    console.log("🧾 SalarySlip API called:", { from, to, employeeId });

    if (!from || !to || !employeeId) {
      return res.status(400).json({
        success: false,
        msg: "From, To and employeeId are required",
      });
    }

    // ✅ Get employee
    const employee = await User.findOne({
      _id: new mongoose.Types.ObjectId(employeeId),
      adminId: req.user._id,
      role: "employee",
    }).select("name email employeeId department position salary joinDate company");

    if (!employee) {
      return res.status(404).json({
        success: false,
        msg: "Employee not found or not under this admin",
      });
    }

    // ✅ Fetch admin for fallback company
    const admin = await User.findById(req.user._id).select("company");

    // ✅ Date range
    const startDate = new Date(from);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999);

    console.log("📅 Date Range:", startDate, endDate);

    // ✅ Attendance records
    const attendance = await Attendance.find({
      userId: employee._id,
      punchIn: { $gte: startDate, $lte: endDate },
    }).sort({ punchIn: 1 });

    console.log("📊 Attendance Count:", attendance.length);

    // ✅ Process Attendance
    let full = 0,
      half = 0,
      absent = 0;

    const records = attendance.map((r) => {
      let hours = 0,
        type = "Absent",
        credit = 0;

      if (r.punchIn && r.punchOut) {
        hours =
          (new Date(r.punchOut) - new Date(r.punchIn)) /
          (1000 * 60 * 60); // hrs
        if (hours >= 6) {
          type = "Full";
          credit = 1;
          full++;
        } else if (hours > 0) {
          type = "Half";
          credit = 0.5;
          half++;
        }
      } else {
        absent++;
      }

      return {
        date: r.punchIn,
        punchIn: r.punchIn,
        punchOut: r.punchOut,
        hours: hours.toFixed(2),
        type,
        credit,
      };
    });

    // ✅ Summary
    const payableDays = full + half * 0.5;
    const payableAmount = payableDays * (employee.salary || 0);

    console.log("📌 Salary Summary:", {
      full,
      half,
      absent,
      payableDays,
      payableAmount,
    });

    return res.json({
      success: true,
      employee: {
        ...employee.toObject(),
        companyName: employee.company || admin.company || "No Company", // ✅ fallback
      },
      period: { from, to },
      summary: { full, half, absent, payableDays, payableAmount },
      records,
    });
  } catch (err) {
    console.error("❌ Get Employee Salary Slip Error:", err);
    return res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};
