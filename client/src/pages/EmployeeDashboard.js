import React, { useEffect, useState } from "react";
import axios from "axios";
import PunchInOut from "../components/PunchInOut";
import LeaveForm from "../components/LeaveForm";
import "./EmployeeDashboard.css";
import EmployeeTaskPage from "./EmployeeTaskPage";
import EmployeeForm from "./EmployeeForm";
import EmployeeProfile from "./EmployeeProfile";
import EmployeeAttendanceLeaveDashboard from "./EmployeeAttendanceLeaveDashboard";

// ✅ Icons
import {
  FaChartPie,
  FaUser,
  FaClock,
  FaCalendarAlt,
  FaTasks,
  FaBug,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
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
          setAllowed(res.data.adminId === adminId);
        } else {
          setAllowed(false);
        }
      } catch (err) {
        console.error("❌ Employee access check error:", err);
        setAllowed(false);
      }
    };

    if (role === "employee") checkEmployeeAccess();
    else setAllowed(false);
  }, [role, API_URL, token, adminId]);

  // ✅ Fetch Attendance
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

  if (allowed === null)
    return (
      <div className="container mt-5 text-center">Checking access...</div>
    );

  if (!allowed)
    return (
      <div className="container mt-5 text-center">
        <h3 className="text-danger">Unauthorized Access</h3>
        <p>You are not allowed to view this page.</p>
      </div>
    );

  const renderLocation = (loc) => {
    if (!loc?.latitude || !loc?.longitude) return "—";
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
    <div className="employee-dashboard">
      {/* ✅ Top Bar for Mobile */}
      <div className="topbar d-flex justify-content-between align-items-center p-3 shadow-sm d-md-none">
        <h5 className="m-0 fw-bold">Employee Dashboard</h5>
        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div className="d-flex flex-column flex-md-row">
        {/* ✅ Sidebar (custom color instead of black) */}
        <div
          className={`sidebar text-white p-0 ${
            sidebarOpen ? "show" : ""
          }`}
        >
          <div className="list-group list-group-flush">
            {[
              { key: "dashboard", icon: <FaChartPie />, label: "Dashboard" },
              { key: "profile", icon: <FaUser />, label: "Profile" },
              { key: "attendance", icon: <FaClock />, label: "Attendance" },
              { key: "leave", icon: <FaCalendarAlt />, label: "Leave" },
              { key: "task", icon: <FaTasks />, label: "My Tasks" },
              { key: "error", icon: <FaBug />, label: "Employee Error" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`list-group-item list-group-item-action ${
                  activeTab === tab.key ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSidebarOpen(false);
                }}
              >
                {tab.icon} <span className="ms-2">{tab.label}</span>
              </button>
            ))}

            <button
              className="list-group-item list-group-item-action text-danger fw-bold"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="me-2" /> Logout
            </button>
          </div>
        </div>

        {/* ✅ Main Content */}
        <div className="main-content p-3 p-md-4 flex-grow-1">
          {activeTab === "dashboard" && (
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h4>Welcome Employee!</h4>
                <EmployeeAttendanceLeaveDashboard />
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <EmployeeProfile />
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h5>Attendance</h5>
                <PunchInOut />
                <div className="mt-4">
                  <h6>My Attendance Records</h6>
                  {attendance.length === 0 ? (
                    <p className="text-muted">No records found.</p>
                  ) : (
                    <div className="table-responsive">
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
                          {attendance.map((rec) => (
                            <tr key={rec._id}>
                              <td>
                                {rec.punchIn
                                  ? new Date(rec.punchIn).toLocaleString(
                                      "en-IN"
                                    )
                                  : "—"}
                              </td>
                              <td>{renderLocation(rec.punchInLocation)}</td>
                              <td>
                                {rec.punchOut
                                  ? new Date(rec.punchOut).toLocaleString(
                                      "en-IN"
                                    )
                                  : "—"}
                              </td>
                              <td>{renderLocation(rec.punchOutLocation)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "leave" && (
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h5>Request Leave</h5>
                <LeaveForm />
              </div>
            </div>
          )}

          {activeTab === "task" && (
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <EmployeeTaskPage />
              </div>
            </div>
          )}

          {activeTab === "error" && (
            <div className="card shadow-sm mb-3">
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
