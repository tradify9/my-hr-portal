import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import axios from "axios";
import {
  FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram,
  FaUserClock, FaFileAlt, FaUsers, FaChartLine,
  FaUserCheck, FaCalendarCheck, FaShieldAlt, FaChartBar, FaGlobe, FaCheckCircle
} from "react-icons/fa";
import "./LoginSection.css";

const Login = ({ setRole }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState("login"); // "login" | "forgot" | "reset"
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("employee");
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL?.trim() || "http://localhost:5000";

  // ----------------- LOGIN -----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
        role: selectedRole,
      });

      if (!res.data?.success || !res.data?.token) {
        return alert(res.data?.msg || "❌ Login failed");
      }

      localStorage.setItem("token", res.data.token);
      if (res.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }

      const role = (res.data?.role || selectedRole).toLowerCase();
      localStorage.setItem("role", role);

      if (role === "employee" && res.data?.user?.admin?._id) {
        localStorage.setItem("adminId", res.data.user.admin._id);
      }

      setRole(role);
      navigate(`/${role}`);
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
      const res = await axios.post(`${API_URL}/api/auth/request-reset`, { username });
      alert(res.data?.msg || "✅ If username/email exists, OTP sent.");
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

      if (!res.data?.success) {
        return alert(res.data?.msg || "❌ Failed to reset password");
      }

      alert(res.data?.msg || "✅ Password reset successful. Please login.");
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
    <>
      <section className="login-section">
        <div className="row h-100 m-0">
          {/* LEFT: HEADING */}
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-center text-white text-center overlay">
            <h1 className="display-3 fw-bold">Welcome Back!</h1>
            <p className="lead w-75 mx-auto">
              Manage your work, track attendance, and connect with your team
              in one place. Enter your login details to continue.
            </p>
            <div className="d-flex gap-4 fs-3 mt-4 social-icons">
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaLinkedinIn /></a>
              <a href="#"><FaInstagram /></a>
            </div>
          </div>

          {/* RIGHT: FORM */}
          <div className="col-md-6 d-flex justify-content-center align-items-center">
            <div className="card login-card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
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

                    {/* <select
                    className="form-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    required
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select> */}
                  </div>
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
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
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
                  <button type="submit" className="btn btn-warning w-100" disabled={loading}>
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
                  <button type="submit" className="btn btn-success w-100" disabled={loading}>
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
          </div>
        </div>
      </section>



      <section className="container my-5">
        <h2 className="text-center mb-4 fw-bold">Benefits of Our HR Portal</h2>
        <p className="text-center text-muted mb-5 w-75 mx-auto">
          Our HR portal makes workforce management simple, effective, and user-friendly.
          With advanced features and easy access, employees and managers both enjoy a seamless experience.
          Here are some key benefits:
        </p>

        <div className="row g-4">
          {/* Card 1 */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm text-center p-3 hr-benefit-card">
              <div className="icon">
                <FaUserClock />
              </div>
              <h5 className="fw-bold">Attendance Tracking</h5>
              <p className="text-muted">
                Monitor daily check-ins, leaves, and working hours in real time,
                making attendance management effortless and transparent.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm text-center p-3 hr-benefit-card">
              <div className="icon">
                <FaFileAlt />
              </div>
              <h5 className="fw-bold">Digital Records</h5>
              <p className="text-muted">
                Store and access employee documents, contracts, and policies
                securely in one place without the hassle of paperwork.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm text-center p-3 hr-benefit-card">
              <div className="icon">
                <FaUsers />
              </div>
              <h5 className="fw-bold">Employee Engagement</h5>
              <p className="text-muted">
                Boost communication, feedback, and collaboration across teams
                with features designed to keep employees engaged.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm text-center p-3 hr-benefit-card">
              <div className="icon">
                <FaChartLine />
              </div>
              <h5 className="fw-bold">Performance Insights</h5>
              <p className="text-muted">
                Get analytics and reports on employee performance to help
                managers make informed decisions and drive growth.
              </p>
            </div>
          </div>
        </div>
      </section>





      <section
        className="hr-portal-info d-flex align-items-center text-white text-center"
      >
        <div className="container">
          <h2 className="fw-bold display-5">Why Choose Our HR Portal?</h2>
          <p className="text-muted">
            Our HR portal is designed to simplify workforce management, improve employee
            engagement, and provide managers with real-time insights. With a modern
            interface and secure features, it ensures that your organization runs smoothly
            and efficiently.
          </p>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">

            {/* Left Side - Text */}
            <div className="col-md-6">
              <h2 className="mb-4">About Our HR Portal</h2>
              <p>
                Our HR Portal is designed to simplify HR operations and provide
                employees with a seamless experience. With real-time tracking,
                secure data, and insightful analytics, managing your workforce
                has never been easier.
              </p>

              <ul className="list-unstyled mt-3">
                <li className="mb-2">
                  <FaCalendarCheck className="text-primary me-2" /> Real-time Attendance & Leave Tracking
                </li>
                <li className="mb-2">
                  <FaUserCheck className="text-success me-2" /> Easy Employee Self-Service
                </li>
                <li className="mb-2">
                  <FaShieldAlt className="text-danger me-2" /> Secure Data Management
                </li>
                <li className="mb-2">
                  <FaChartBar className="text-warning me-2" /> Insightful Analytics & Reports
                </li>
                <li className="mb-2">
                  <FaGlobe className="text-info me-2" /> 24/7 Access from Anywhere
                </li>
              </ul>

              <button className="btn btn-primary mt-3">Learn More</button>
            </div>

            {/* Right Side - Image */}
            <div className="col-md-6 text-center">
              <img
                src="https://img.freepik.com/free-vector/office-workers-analyzing-data-charts_1262-19783.jpg"
                alt="HR Portal"
                className="img-fluid rounded shadow"
              />
            </div>
          </div>
        </div>
      </section>


      <section className="py-5 bg-light">
        <div className="container text-center">
          <h2 className="mb-4">Our HR Portal Plans</h2>
          <p className="mb-5 text-muted">
            Choose the plan that fits your organization’s needs.
            Scale easily as your team grows.
          </p>

          <div className="row">
            {/* ===== Basic Plan ===== */}
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm border-top border-4 border-primary">
                <div className="card-body">
                  <h4 className="card-title mb-3">Basic</h4>
                  <h3 className="text-primary mb-4">₹999 / month</h3>
                  <ul className="list-unstyled text-start">
                    <li><FaCheckCircle className="me-2 text-primary" /> Attendance Tracking</li>
                    <li><FaCheckCircle className="me-2 text-primary" /> Leave Management</li>
                    <li><FaCheckCircle className="me-2 text-primary" /> Basic Reports</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ===== Standard Plan ===== */}
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm border-top border-4 border-success">
                <div className="card-body">
                  <h4 className="card-title mb-3">Standard</h4>
                  <h3 className="text-success mb-4">₹1999 / month</h3>
                  <ul className="list-unstyled text-start">
                    <li><FaCheckCircle className="me-2 text-success" /> Everything in Basic</li>
                    <li><FaCheckCircle className="me-2 text-success" /> Employee Self-Service</li>
                    <li><FaCheckCircle className="me-2 text-success" /> Secure Data Management</li>
                    <li><FaCheckCircle className="me-2 text-success" /> Analytics Dashboard</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ===== Premium Plan ===== */}
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm border-top border-4 border-warning">
                <div className="card-body">
                  <h4 className="card-title mb-3">Premium</h4>
                  <h3 className="text-warning mb-4">₹2999 / month</h3>
                  <ul className="list-unstyled text-start">
                    <li><FaCheckCircle className="me-2 text-warning" /> Everything in Standard</li>
                    <li><FaCheckCircle className="me-2 text-warning" /> Custom Integrations</li>
                    <li><FaCheckCircle className="me-2 text-warning" /> Priority Support</li>
                    <li><FaCheckCircle className="me-2 text-warning" /> Advanced Insights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      <footer className="footer text-white pt-5 pb-3 mt-5">
        <div className="overlay">
          <div className="container">
            <div className="row">
              {/* Column 1 */}
              <div className="col-md-4 mb-4">
                <h3 className="fw-bold">HR Portal</h3>
                <p className="text-muted">
                  Simplifying workforce management with attendance tracking,
                  performance insights, and digital records in one place.
                </p>
              </div>

              {/* Column 2 */}
              <div className="col-md-4 mb-4">
                <h5 className="fw-bold mb-3">Quick Links</h5>
                <ul className="list-unstyled">
                  <li><a href="/" className="footer-link">Home</a></li>
                  <li><a href="/about" className="footer-link">About</a></li>
                  <li><a href="/hr/fea" className="footer-link">Features</a></li>
                  <li><a href="/contect" className="footer-link">Contact</a></li>
                  <li><a href="/HR/policies" className="footer-link"> Privacy Policy</a></li>
                </ul>
              </div>

              {/* Column 3 */}
              <div className="col-md-4 mb-4">
                <h5 className="fw-bold mb-3">Get in Touch</h5>
                <p className="text-muted ">Email: support@hrportal.com</p>
                <p className="text-muted ">Phone: +91 98765 43210</p>
                <div className="d-flex gap-3 fs-4 mt-3">
                  <a href="#"><FaFacebookF /></a>
                  <a href="#"><FaTwitter /></a>
                  <a href="#"><FaLinkedinIn /></a>
                  <a href="#"><FaInstagram /></a>
                </div>
              </div>
            </div>

            <hr className="border-light" />
            <p className=" text-muted text-center m-0">© {new Date().getFullYear()} HR Portal. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

    </>


  );
};

export default Login;
