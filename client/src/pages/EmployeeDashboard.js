import React, { useEffect, useState } from "react";
import axios from "axios";
import PunchInOut from "../components/PunchInOut";
import LeaveForm from "../components/LeaveForm";
import "./EmployeeDashboard.css";
import EmployeeTaskPage from "./EmployeeTaskPage";
import EmployeeForm from "./EmployeeForm";
import EmployeeProfile from "./EmployeeProfile";

// ✅ Import Icons
import {
  FaChartPie,
  FaUser,
  FaClock,
  FaCalendarAlt,
  FaTasks,
  FaBug,
  FaSignOutAlt,
} from "react-icons/fa";
import EmployeeAttendanceLeaveDashboard from "./EmployeeAttendanceLeaveDashboard";

const EmployeeDashboard = () => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const adminId = localStorage.getItem("adminId");
  const API_URL =
    (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim()) ||
    "http://localhost:5000";

  const [allowed, setAllowed] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("adminId");
    window.location.href = "/"; // direct redirect
  };

  // ✅ Check access
  useEffect(() => {
    const checkEmployeeAccess = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/employee/verify-access`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (
          (res.data?.allowed || res.data?.success) &&
          res.data?.role === "employee"
        ) {
          if (!adminId || res.data.adminId !== adminId) {
            setAllowed(false);
          } else {
            setAllowed(true);
          }
        } else {
          setAllowed(false);
        }
      } catch (err) {
        console.error("❌ Employee access check error:", err);
        setAllowed(false);
      }
    };

    if (role === "employee") {
      checkEmployeeAccess();
    } else {
      setAllowed(false);
    }
  }, [role, API_URL, token, adminId]);

  // ✅ Attendance fetch
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/employee/attendance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendance(res.data?.attendance || []);
      } catch (err) {
        console.error("❌ Fetch attendance error:", err);
      }
    };

    if (allowed) fetchAttendance();
  }, [allowed, API_URL, token]);

  if (allowed === null) {
    return (
      <div className="container mt-5 text-center">Checking access...</div>
    );
  }

  if (!allowed) {
    return (
      <div className="container mt-5 text-center">
        <h3 className="text-danger"> Unauthorized Access</h3>
        <p>You are not allowed to view this page.</p>
      </div>
    );
  }

  // ✅ Utility to render location with Google Maps link
  const renderLocation = (loc) => {
    if (!loc || !loc.latitude || !loc.longitude) return "—";
    return (
      <a
        href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
      </a>
    );
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-12 col-md-3 col-lg-2 p-0">
          <div className="sidebar">
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action ${
                  activeTab === "dashboard" ? "active" : ""
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                <FaChartPie className="me-2" /> Dashboard
              </button>

              <button
                className={`list-group-item list-group-item-action ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <FaUser className="me-2" /> Profile
              </button>

              <button
                className={`list-group-item list-group-item-action ${
                  activeTab === "attendance" ? "active" : ""
                }`}
                onClick={() => setActiveTab("attendance")}
              >
                <FaClock className="me-2" /> Attendance
              </button>

              <button
                className={`list-group-item list-group-item-action ${
                  activeTab === "leave" ? "active" : ""
                }`}
                onClick={() => setActiveTab("leave")}
              >
                <FaCalendarAlt className="me-2" /> Request Leave
              </button>

              <button
                className={`list-group-item list-group-item-action ${
                  activeTab === "task" ? "active" : ""
                }`}
                onClick={() => setActiveTab("task")}
              >
                <FaTasks className="me-2" /> My Tasks
              </button>

              <button
                className={`list-group-item list-group-item-action ${
                  activeTab === "error" ? "active" : ""
                }`}
                onClick={() => setActiveTab("error")}
              >
                <FaBug className="me-2" /> Employee Error
              </button>

              {/* 🚪 Logout */}
              <button
                className="list-group-item list-group-item-action text-danger fw-bold"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="me-2" /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-12 col-md-9 col-lg-10 main-content">
          <h1 className="mb-4">Employee Dashboard</h1>

          {activeTab === "dashboard" && (
            <div>
              <h3> Welcome Employee!</h3>
              <p className="text-muted">
                <EmployeeAttendanceLeaveDashboard/>
              </p>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="card shadow-sm">
              <div className="card-body">
                <EmployeeProfile />
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3"> Attendance</h5>
                <PunchInOut />

                {/* ✅ Attendance Table */}
                <div className="mt-4">
                  <h6>My Attendance Records</h6>
                  {attendance.length === 0 ? (
                    <p className="text-muted">No attendance records found.</p>
                  ) : (
                    <table className="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th>Punch In</th>
                          <th>In Location</th>
                          <th>Punch Out</th>
                          <th>Out Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map((record) => (
                          <tr key={record._id}>
                            <td>
                              {record.punchIn
                                ? new Date(record.punchIn).toLocaleString(
                                    "en-IN"
                                  )
                                : "—"}
                            </td>
                            <td>{renderLocation(record.punchInLocation)}</td>
                            <td>
                              {record.punchOut
                                ? new Date(record.punchOut).toLocaleString(
                                    "en-IN"
                                  )
                                : "—"}
                            </td>
                            <td>{renderLocation(record.punchOutLocation)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "leave" && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3"> Request Leave</h5>
                <LeaveForm />
              </div>
            </div>
          )}

          {activeTab === "task" && (
            <div className="card shadow-sm">
              <div className="card-body">
                <EmployeeTaskPage />
              </div>
            </div>
          )}

          {activeTab === "error" && (
            <div className="card shadow-sm">
              <div className="card-body">
                <EmployeeForm />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
