const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true, // allows null without duplicate error
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // hide by default
    },

    employeeId: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      default: null, // ✅ no validation errors for admins
    },

    name: {
      type: String,
      trim: true,
      default: null,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    department: {
      type: String,
      trim: true,
      default: null,
    },

    position: {
      type: String,
      default: null,
    },

    salary: {
      type: Number,
      default: null,
    },

    joinDate: {
      type: Date,
      default: null,
    },

    company: {
      type: String,
      trim: true,
      default: null,
    },

    image: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["superadmin", "admin", "employee"],
      default: "employee",
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    resetOtp: { type: String, select: false, default: null },
    resetOtpExpire: { type: Date, select: false, default: null },
  },
  { timestamps: true }
);

/* ======================================================
   🔹 Pre-save Hook
   Auto-generate username + hash password
====================================================== */
userSchema.pre("save", async function (next) {
  try {
    // Auto-generate username if missing
    if (this.isNew && !this.username) {
      let base = "";

      if (this.name) base = this.name.toLowerCase().replace(/\s+/g, "");
      else if (this.email) base = this.email.split("@")[0].toLowerCase();
      else base = "user";

      this.username = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Hash password if new or changed
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }

    next();
  } catch (err) {
    console.error("❌ Error in pre-save hook:", err.message);
    next(err);
  }
});

/* ======================================================
   🔹 Pre-update Hooks (hash password on update)
====================================================== */
async function hashPasswordHook(next) {
  const update = this.getUpdate();

  if (update?.password) {
    update.password = await bcrypt.hash(update.password, 10);
    this.setUpdate(update);
  }

  next();
}

userSchema.pre("findOneAndUpdate", hashPasswordHook);
userSchema.pre("updateOne", hashPasswordHook);

/* ======================================================
   🔹 Compare Password
====================================================== */
userSchema.methods.comparePassword = async function (plainPassword) {
  if (!this.password) return false;
  return bcrypt.compare(plainPassword, this.password);
};

/* ======================================================
   🔹 Clean JSON Response
====================================================== */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  delete obj.resetOtp;
  delete obj.resetOtpExpire;
  return obj;
};

/* ======================================================
   🔹 Indexes
====================================================== */
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ employeeId: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true });

/* ======================================================
   🔹 Export Model
====================================================== */
module.exports = mongoose.model("User", userSchema);
