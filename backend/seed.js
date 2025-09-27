const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const seedSuperAdmin = async () => {
  try {
    // ✅ Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || "myappdb", // ensure correct DB
    });
    console.log("✅ Connected to MongoDB");

    // ✅ Check if superadmin already exists
    const existing = await User.findOne({ role: "superadmin" });
    if (existing) {
      console.log("⚠️ Super Admin already exists:", existing.username);
      process.exit(0);
    }

    // ✅ Create new superadmin (with all required fields)
    const superAdmin = new User({
      username: "superadmin",
      email: "superadmin@example.com",   // 🔑 REQUIRED
      name: "System Super Admin",        // ✅ good practice
      password: "superadmin123",         // plain text → schema pre-save hook will hash
      role: "superadmin",
    });

    await superAdmin.save();
    console.log("🎉 Super Admin created successfully:", superAdmin.username);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding Super Admin:", err.message);
    process.exit(1);
  }
};

seedSuperAdmin();
