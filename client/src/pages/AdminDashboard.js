import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate import

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("employees");
  const [loading, setLoading] = useState(false);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const navigate = useNavigate(); // ✅ navigation hook

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("adminId");
    navigate("/"); // redirect to login
  };

  // ✅ Fetch Profile
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.admin);
    } catch (err) {
      console.error("Fetch Profile error:", err.response?.data || err.message);
    }
  };

  // ✅ Fetch Employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const employeesData = res.data.employees || res.data;
      setEmployees(employeesData);
      setFilteredEmployees(employeesData);
    } catch (err) {
      console.error("❌ Fetch Employees error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Leaves
  const fetchLeaves = async () => {
    setLoadingLeaves(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(res.data.leaves || res.data);
    } catch (err) {
      console.error("❌ Fetch Leaves error:", err.response?.data || err.message);
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
      const updatedEmployees = employees.filter((e) => e._id !== id);
      setEmployees(updatedEmployees);
      setFilteredEmployees(updatedEmployees);
    } catch (err) {
      console.error("❌ Delete Employee error:", err.response?.data || err.message);
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
      console.error("❌ Leave Action error:", err.response?.data || err.message);
    }
  };

  // ✅ Search Function
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

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className="bg-dark text-white p-3"
        style={{ minHeight: "100vh", width: "220px" }}
      >
        <h4>Admin Panel</h4>
        <p className="mt-2">👤 {profile?.username || "Admin"}</p>
        <p className="mb-4">🏢 {profile?.company || "No Company"}</p>

        <ul className="nav flex-column mt-4">
          <li
            className={`nav-item mb-2 ${activeTab === "employees" ? "fw-bold" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setActiveTab("employees")}
          >
            👥 Employees
          </li>
          <li className="nav-item mb-2">
            <Link
              to="/admin/create-employee"
              className="text-white text-decoration-none"
            >
              ➕ Add Employee
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link
              to="/admin/attendance"
              className="text-white text-decoration-none"
            >
              📍 Employee Attendance
            </Link>
          </li>
          <li
            className={`nav-item mb-2 ${activeTab === "leaves" ? "fw-bold" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setActiveTab("leaves")}
          >
            📝 Leave Approvals
          </li>

          <Link to="/salary/slipe" className="list-group-item list-group-item-action">
            💰 Salary Slip
          </Link>

          <li className="nav-item mb-2">
            <Link to="/admin/task" className="nav-link text-white">
              📝 Manage Tasks
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/messages" className="nav-link text-white">
              Admin Page
            </Link>
          </li>

          {/* 🚪 Logout */}
          <li className="nav-item mt-3">
            <button
              className="btn btn-danger w-100 fw-bold"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4">
        <h2>Welcome, {profile?.username || "Admin"} 👋</h2>
        <h5>Company: {profile?.company || "Not Assigned"}</h5>

        {/* Employees List */}
        {activeTab === "employees" && (
          <>
            <h4>Employees</h4>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Search by name or email..."
              value={search}
              onChange={handleSearch}
            />
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="table table-bordered">
                <thead>
                  <tr>
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
                      <td>{emp.employeeId}</td>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.position}</td>
                      <td>{emp.salary}</td>
                      <td>
                        <Link
                          to={`/admin/edit-employee/${emp._id}`}
                          className="btn btn-sm btn-warning me-2"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(emp._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No matching employees found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* Leaves */}
        {activeTab === "leaves" && (
          <>
            <h4>Leave Requests</h4>
            {loadingLeaves ? (
              <p>Loading...</p>
            ) : (
              <table className="table table-bordered">
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
                              className="btn btn-sm btn-success me-2"
                              onClick={() => handleLeaveAction(leave._id, "approved")}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
