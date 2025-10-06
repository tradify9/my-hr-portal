import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

// ✅ Import child components
import CreateEmployee from "./CreateEmployee";
import EmployeeAttendance from "./EmployeeAttendance";
import SalarySlipPage from "./SalarySlipPage";
import AdminTaskPage from "./AdminTaskPage";
import AdminMessages from "./AdminMessages";
import AttendanceLeaveDashboard from "./AttendanceLeaveDashboard";

// ✅ Import Icons
import {
  FaUsers,
  FaUserPlus,
  FaCalendarCheck,
  FaFileInvoiceDollar,
  FaTasks,
  FaEnvelope,
  FaSignOutAlt,
  FaClipboardList,
  FaTachometerAlt
} from "react-icons/fa";

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("attendanceGif");
  const [loading, setLoading] = useState(false);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [search, setSearch] = useState("");

  // ✅ For editing employee
  const [editEmployee, setEditEmployee] = useState(null);

  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // ✅ Logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // ✅ Profile
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.admin);
    } catch (err) {
      console.error("Profile error:", err);
    }
  };

  // ✅ Employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.employees || res.data;
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (err) {
      console.error("Employees error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Leaves
  const fetchLeaves = async () => {
    setLoadingLeaves(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(res.data.leaves || res.data);
    } catch (err) {
      console.error("Leaves error:", err);
      setLeaves([]);
    } finally {
      setLoadingLeaves(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchEmployees();
      fetchLeaves();
    }
  }, [token]);

  // ✅ Delete Employee
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axios.delete(`${API_URL}/api/admin/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = employees.filter((e) => e._id !== id);
      setEmployees(updated);
      setFilteredEmployees(updated);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ✅ Approve/Reject Leave
  const handleLeaveAction = async (id, action) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/leaves/${id}`,
        { status: action.toLowerCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeaves();
    } catch (err) {
      console.error("Leave action error:", err);
    }
  };

  // ✅ Search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(value) ||
        emp.email?.toLowerCase().includes(value)
    );
    setFilteredEmployees(filtered);
  };

  // ✅ Save Edited Employee
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      formData.append("employeeId", editEmployee.employeeId || "");
      formData.append("name", editEmployee.name || "");
      formData.append("email", editEmployee.email || "");
      formData.append("position", editEmployee.position || "");
      formData.append("salary", editEmployee.salary || "");
      formData.append("department", editEmployee.department || "");
      formData.append("joinDate", editEmployee.joinDate || "");

      await axios.put(
        `${API_URL}/api/admin/employees/${editEmployee._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("✅ Employee updated successfully!");
      setEditEmployee(null);
      fetchEmployees();
    } catch (err) {
      console.error("Update error:", err);
      alert("❌ Failed to update employee");
    }
  };




  return (

    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h4 className="sidebar-title"> Admin Panel</h4>
        <p className="profile-info"> {profile?.username || "Admin"}</p>
        <p className="profile-info"> {profile?.company || "No Company"}</p>

        <ul className="nav-links">

          <li
            className={`nav-item ${activeTab === "attendanceGif" ? "active" : ""}`}
            onClick={() => setActiveTab("attendanceGif")}
          >
            <FaTachometerAlt className="me-2" /> Dashboard
          </li>
          <li
            className={activeTab === "employees" ? "active" : ""}
            onClick={() => {
              setActiveTab("employees");
              setEditEmployee(null);
            }}
          >
            <FaUsers className="me-2" /> Employees
          </li>
          <li
            className={activeTab === "create-employee" ? "active" : ""}
            onClick={() => setActiveTab("create-employee")}
          >
            <FaUserPlus className="me-2" /> Add Employee
          </li>
          <li
            className={activeTab === "attendance" ? "active" : ""}
            onClick={() => setActiveTab("attendance")}
          >
            <FaCalendarCheck className="me-2" /> Emp Attendance
          </li>
          <li
            className={activeTab === "leaves" ? "active" : ""}
            onClick={() => setActiveTab("leaves")}
          >
            <FaClipboardList className="me-2" /> Leave Approvals
          </li>
          <li
            className={activeTab === "salary-slip" ? "active" : ""}
            onClick={() => setActiveTab("salary-slip")}
          >
            <FaFileInvoiceDollar className="me-2" /> Salary Slip
          </li>
          <li
            className={activeTab === "tasks" ? "active" : ""}
            onClick={() => setActiveTab("tasks")}
          >
            <FaTasks className="me-2" /> Manage Tasks
          </li>
          <li
            className={activeTab === "messages" ? "active" : ""}
            onClick={() => setActiveTab("messages")}
          >
            <FaEnvelope className="me-2" /> Admin Messages
          </li>

        </ul>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="me-2" /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h2>Welcome, {profile?.username || "Admin"} </h2>
        <h5>Company: {profile?.company || "Not Assigned"}</h5>

        {/* Employees List */}
        {activeTab === "employees" && !editEmployee && (
          <>
            <div className="section-header">
              <h4>Employees</h4>
              <input
                type="text"
                placeholder="🔍 Search by name or email..."
                value={search}
                onChange={handleSearch}
              />
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>EmployeeID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Position</th>
                      <th>Salary</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => (
                      <tr key={emp._id}>
                        <td>
                          {emp.image ? (
                            <img
                              src={`${API_URL}${emp.image}`}
                              alt={emp.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                              }}
                            />
                          ) : (
                            "No Image"
                          )}
                        </td>
                        <td>{emp.employeeId}</td>
                        <td>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.position}</td>
                        <td>{emp.salary}</td>
                        <td>
                          <button
                            className="btn-warning"
                            onClick={() => setEditEmployee(emp)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleDelete(emp._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredEmployees.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center" }}>
                          No matching employees found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Edit Employee Form */}
        {activeTab === "employees" && editEmployee && (
          <div>
            <h3 className="mb-3" style={{ color: "#0f3460" }}>
              Edit Employee
            </h3>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editEmployee.employeeId || ""}
                    onChange={(e) =>
                      setEditEmployee({
                        ...editEmployee,
                        employeeId: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editEmployee.name || ""}
                    onChange={(e) =>
                      setEditEmployee({
                        ...editEmployee,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editEmployee.email || ""}
                    onChange={(e) =>
                      setEditEmployee({
                        ...editEmployee,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>Position</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editEmployee.position || ""}
                    onChange={(e) =>
                      setEditEmployee({
                        ...editEmployee,
                        position: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>Salary</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editEmployee.salary || ""}
                    onChange={(e) =>
                      setEditEmployee({
                        ...editEmployee,
                        salary: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>Department</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editEmployee.department || ""}
                    onChange={(e) =>
                      setEditEmployee({
                        ...editEmployee,
                        department: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>Join Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={
                      editEmployee.joinDate
                        ? new Date(editEmployee.joinDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditEmployee({
                        ...editEmployee,
                        joinDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-actions mt-3">
                <button type="submit" className="btn btn-success me-2">
                  Update
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditEmployee(null)}
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leaves */}
        {activeTab === "leaves" && (
          <>
            <h4>Leave Requests</h4>
            {loadingLeaves ? (
              <p>Loading...</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave._id}>
                        <td>{leave.userId?.name || "Unknown"}</td>
                        <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                        <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                        <td>{leave.reason}</td>
                        <td>{leave.status}</td>
                        <td>
                          {leave.status === "pending" && (
                            <>
                              <button
                                className="btn-success"
                                onClick={() => handleLeaveAction(leave._id, "approved")}
                              >
                                Approve
                              </button>
                              <button
                                className="btn-danger"
                                onClick={() => handleLeaveAction(leave._id, "rejected")}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Other Pages */}
        {activeTab === "create-employee" && <CreateEmployee />}
        {activeTab === "attendance" && <EmployeeAttendance />}
        {activeTab === "salary-slip" && <SalarySlipPage />}
        {activeTab === "tasks" && <AdminTaskPage />}
        {activeTab === "messages" && <AdminMessages />}
        {activeTab === "attendanceGif" && <AttendanceLeaveDashboard />}
      </div>
    </div>
  );
};

export default AdminDashboard;
