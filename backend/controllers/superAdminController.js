const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

// ✅ Create Admin
exports.createAdmin = async (req, res) => {
  try {
    const { username, email, password, company } = req.body;

    // ---------------- Validation ----------------
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ---------------- Duplicate Check ----------------
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        msg: "Email already exists",
      });
    }

    // ---------------- Create Admin ----------------
    const admin = new User({
      username: username?.trim(),
      email: normalizedEmail,
      company: company?.trim(),
      password: password.toString().trim(), // schema hook hashes it
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin created:", admin.username || admin.email);

    // ---------------- Send Email with Details ----------------
    try {
      const emailContent = `
        <h2>Welcome, ${username || "Admin"}!</h2>
        <p>Your Admin account has been created successfully. Here are your details:</p>
        <ul>
          <li><b>Username:</b> ${username || "N/A"}</li>
          <li><b>Email:</b> ${normalizedEmail}</li>
          <li><b>Company:</b> ${company || "N/A"}</li>
          <li><b>Password:</b> ${password}</li>
        </ul>
        <p>👉 Please login and change your password after first login.</p>
      `;

      await sendEmail(
        normalizedEmail,
        "Your Admin Account Details",
        emailContent
      );

      console.log(`📧 Admin account details sent to ${normalizedEmail}`);
    } catch (emailErr) {
      console.warn("⚠️ Failed to send admin email:", emailErr.message);
    }

    // ---------------- Response ----------------
    const adminData = admin.toJSON(); // password auto-remove
    res.status(201).json(adminData); // ✅ return only admin object
  } catch (err) {
    console.error("❌ Create Admin Error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error while creating admin",
      error: err.message,
    });
  }
};



// ✅ Update Admin
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const admin = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!admin) return res.status(404).json({ msg: "Admin not found" });

    res.json(admin);
  } catch (err) {
    console.error("❌ Update Admin Error:", err);
    res.status(500).json({ msg: "Server error while updating admin" });
  }
};

// ✅ Delete Admin
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findByIdAndDelete(id);

    if (!admin) return res.status(404).json({ msg: "Admin not found" });

    res.json({ msg: "Admin deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Admin Error:", err);
    res.status(500).json({ msg: "Server error while deleting admin" });
  }
};

// ✅ Get Admins
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.json(admins);
  } catch (err) {
    console.error("❌ Get Admins Error:", err);
    res.status(500).json({ msg: "Server error while fetching admins" });
  }
};
