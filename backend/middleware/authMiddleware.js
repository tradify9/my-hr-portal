const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = (roles = []) => {
  // Ensure roles is always array
  if (typeof roles === "string") roles = [roles];

  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      // ✅ Check token
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, msg: "No token provided" });
      }

      const token = authHeader.split(" ")[1];

      // ✅ Verify token
      let decoded;
      try {
        decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "insecure_default_secret"
        );
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ success: false, msg: "Token expired, please login again" });
        }
        return res.status(401).json({ success: false, msg: "Invalid token" });
      }

      // ✅ Get user from DB
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res
          .status(401)
          .json({ success: false, msg: "User not found" });
      }

      // ✅ Attach user to request
      req.user = user;

      // ✅ Normalize roles (always lowercase)
      const userRole = user.role.toLowerCase();
      if (roles.length && !roles.map(r => r.toLowerCase()).includes(userRole)) {
        return res
          .status(403)
          .json({ success: false, msg: "Access denied: Insufficient role" });
      }

      next();
    } catch (err) {
      console.error("❌ AuthMiddleware error:", err.message);
      return res
        .status(500)
        .json({ success: false, msg: "Server error in authentication" });
    }
  };
};

module.exports = protect;
