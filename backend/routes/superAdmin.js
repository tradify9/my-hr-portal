const express = require("express");
const {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdmins,
} = require("../controllers/superAdminController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Only superadmin allowed
router.get("/admins", protect(["superadmin"]), getAdmins);
router.post("/admins", protect(["superadmin"]), createAdmin);
router.put("/admins/:id", protect(["superadmin"]), updateAdmin);
router.delete("/admins/:id", protect(["superadmin"]), deleteAdmin);

module.exports = router;
