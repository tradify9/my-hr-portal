import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ setRole }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState("login"); // "login" | "forgot" | "reset"
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Use one consistent API base URL
  const API_URL = process.env.REACT_APP_API_URL?.trim() || "http://localhost:5000";

  // ----------------- LOGIN -----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });

      console.log("✅ Login response:", res.data);

      if (!res.data?.success || !res.data?.token) {
        return alert(res.data?.msg || "❌ Login failed");
      }

      // save tokens
      localStorage.setItem("token", res.data.token);
      if (res.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }

      // save role
      const role = res.data?.role?.toLowerCase();
      if (role) {
        localStorage.setItem("role", role);

        // ✅ Save adminId only if employee
        if (role === "employee" && res.data?.user?.admin?._id) {
          localStorage.setItem("adminId", res.data.user.admin._id);
        }

        // set app-level role
        setRole(role);

        // ✅ Navigate to correct dashboard
        navigate(`/${role}`);
      } else {
        alert("❌ Invalid role returned from server");
      }
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------- REQUEST OTP -----------------
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/request-reset`, {
        username,
      });
      console.log("✅ Request OTP response:", res.data);

      alert(
        res.data?.msg || "✅ If username/email exists, OTP sent to registered email."
      );
      setStep("reset");
    } catch (err) {
      console.error("❌ OTP request error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Failed to request OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------- CONFIRM RESET -----------------
  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/confirm-reset`, {
        username,
        otp,
        newPassword,
      });

      console.log("✅ Confirm reset response:", res.data);

      if (!res.data?.success) {
        return alert(res.data?.msg || "❌ Failed to reset password");
      }

      alert(res.data?.msg || "✅ Password reset successful. Please login.");

      // reset state
      setStep("login");
      setOtp("");
      setNewPassword("");
      setPassword("");
      setUsername("");
    } catch (err) {
      console.error("❌ Reset error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------- JSX -----------------
  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="text-center mb-4">
        {step === "login"
          ? "Login"
          : step === "forgot"
          ? "Forgot Password"
          : "Reset Password"}
      </h3>

      {/* ----------------- LOGIN ----------------- */}
      {step === "login" && (
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Username / Email</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p
            className="mt-3 text-center text-primary"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setStep("forgot");
              setPassword("");
            }}
          >
            Forgot Password?
          </p>
        </form>
      )}

      {/* ----------------- FORGOT PASSWORD ----------------- */}
      {step === "forgot" && (
        <form onSubmit={handleRequestOTP}>
          <div className="mb-3">
            <label className="form-label">Username / Email</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-warning w-100"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP to Email"}
          </button>

          <p
            className="mt-3 text-center text-secondary"
            style={{ cursor: "pointer" }}
            onClick={() => setStep("login")}
          >
            Back to Login
          </p>
        </form>
      )}

      {/* ----------------- RESET PASSWORD ----------------- */}
      {step === "reset" && (
        <form onSubmit={handleConfirmReset}>
          <div className="mb-3">
            <label className="form-label">OTP</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <p
            className="mt-3 text-center text-secondary"
            style={{ cursor: "pointer" }}
            onClick={() => setStep("login")}
          >
            Back to Login
          </p>
        </form>
      )}
    </div>
  );
};

export default Login;
