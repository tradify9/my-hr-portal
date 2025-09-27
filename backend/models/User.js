const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // hide password by default
    },
    employeeId: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      sparse: true,
      required: function () {
        return this.role === "employee";
      },
    },
    name: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "employee";
      },
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
      required: function () {
        return this.role === "employee";
      },
    },
    position: {
      type: String,
      required: function () {
        return this.role === "employee";
      },
    },
    salary: {
      type: Number,
      required: function () {
        return this.role === "employee";
      },
    },
    joinDate: {
      type: Date,
      required: function () {
        return this.role === "employee";
      },
    },
    company: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "admin";
      },
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
    },
    resetOtp: { type: String, select: false },
    resetOtpExpire: { type: Date, select: false },
  },
  { timestamps: true }
);

/**
 * 🔹 Pre-save hook (hash password if modified)
 */
userSchema.pre("save", async function (next) {
  try {
    if (this.isNew && !this.username) {
      if (this.name) {
        const base = this.name.toLowerCase().replace(/\s+/g, "");
        this.username = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
      } else if (this.email) {
        const base = this.email.split("@")[0];
        this.username = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
      } else {
        this.username = `user${Date.now()}`;
      }
    }

    if (this.isModified("password")) {
      console.log("🔑 Hashing password for:", this.username || this.email);
      this.password = await bcrypt.hash(this.password, 10);
    }

    next();
  } catch (err) {
    next(err);
  }
});

/**
 * 🔹 Pre-update hook (for findOneAndUpdate & updateOne)
 * ensures password is hashed when updated directly
 */
async function hashPasswordHook(next) {
  const update = this.getUpdate();

  if (update?.password) {
    console.log("🔑 Hashing password in update for:", update.username || update.email);
    update.password = await bcrypt.hash(update.password, 10);
    this.setUpdate(update);
  }

  next();
}

userSchema.pre("findOneAndUpdate", hashPasswordHook);
userSchema.pre("updateOne", hashPasswordHook);

/**
 * 🔹 Compare password
 */
userSchema.methods.comparePassword = async function (plainPassword) {
  if (!this.password) return false;
  return bcrypt.compare(plainPassword, this.password);
};

/**
 * 🔹 Clean response
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  delete obj.resetOtp;
  delete obj.resetOtpExpire;
  return obj;
};

// Indexes
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ employeeId: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
