import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import "./SuperAdminDashboard.css";

const SuperAdminDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [username, setUsername] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");
  const loggedInUser = localStorage.getItem("username");
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // =============================
  // FETCH DATA ON LOAD
  // =============================
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchAdmins();
    fetchEmployees();
  }, [token]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/superadmin/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data.admins || []);
    } catch (err) {
      console.error("❌ Fetch Admins Error:", err);
      alert("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/superadmin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.error("❌ Fetch Employees Error:", err);
    }
  };

  const handleSubmitAdmin = async (e) => {
    e.preventDefault();
    try {
      const payload = { username, company, email, password };
      let res;

      if (editId) {
        res = await axios.put(`${API_URL}/api/superadmin/admins/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedAdmin = res.data.admin;
        setAdmins(admins.map((a) => (a._id === editId ? updatedAdmin : a)));
        setEditId(null);
      } else {
        res = await axios.post(`${API_URL}/api/superadmin/admins`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newAdmin = res.data.admin;
        setAdmins([...admins, newAdmin]);
      }

      setUsername("");
      setCompany("");
      setEmail("");
      setPassword("");
      alert(res.data.msg || "Success");
    } catch (err) {
      console.error("❌ Save Admin Error:", err);
      alert(err.response?.data?.msg || "Failed to save admin");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      const res = await axios.delete(`${API_URL}/api/superadmin/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.msg || "Deleted successfully");
      setAdmins(admins.filter((a) => a._id !== id));
    } catch (err) {
      console.error("❌ Delete Admin Error:", err);
      alert(err.response?.data?.msg || "Failed to delete admin");
    }
  };

  const handleEditAdmin = (admin) => {
    setEditId(admin._id);
    setUsername(admin.username || "");
    setCompany(admin.company || "");
    setEmail(admin.email || "");
    setPassword("");
    setActivePage("admins");
  };

  const handleToggleAdminStatus = async (admin) => {
    try {
      const newStatus = !admin.isActive;
      const res = await axios.patch(
        `${API_URL}/api/superadmin/admins/${admin._id}/status`,
        { isActive: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedAdmin = res.data.admin;
      setAdmins(admins.map((a) => (a._id === admin._id ? updatedAdmin : a)));
      alert(res.data.msg || "Status updated");
    } catch (err) {
      console.error("❌ Toggle Admin Status Error:", err);
      alert(err.response?.data?.msg || "Failed to update admin status");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      navigate("/");
    }
  };

  const safeSearch = search.toLowerCase();
  const filteredAdmins = admins.filter((a) =>
    [a.username, a.email, a.company]
      .map((x) => x?.toLowerCase() || "")
      .some((v) => v.includes(safeSearch))
  );

  const menuItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "admins", label: "Manage Admins" },
    
  ];

  return (
    <div className="superadmin-dashboard">
      {/* Sidebar Toggle Button (Mobile) */}
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <aside className={`superadmin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <h4 className="mb-4 text-center">Super Admin</h4>
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li key={item.key} className="nav-item mb-2">
              <button
                className={`btn w-100 text-start ${
                  activePage === item.key ? "btn-secondary" : "btn-dark"
                }`}
                onClick={() => {
                  setActivePage(item.key);
                  setSidebarOpen(false);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        <hr />
        <div className="text-center mt-auto">
          {loggedInUser && <div className="mb-2">👤 {loggedInUser}</div>}
          <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="superadmin-content">
        {activePage === "dashboard" && (
          <div className="content-card">
            <h2>Dashboard</h2>
            <p>Welcome back, {loggedInUser}!</p>
            <div className="stats-grid">
              <div className="stat-card">
                <h5>Total Admins</h5>
                <h3>{admins.length}</h3>
              </div>
              <div className="stat-card">
                <h5>Total Employees</h5>
                <h3>{employees.length}</h3>
              </div>
            </div>
          </div>
        )}

        {activePage === "admins" && (
          <div className="content-card">
            <h2>Manage Admins</h2>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Search by username, email, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <small className="text-muted">Found {filteredAdmins.length} admins</small>

            {loading ? (
              <p>Loading admins...</p>
            ) : filteredAdmins.length > 0 ? (
              <ul className="list-group mt-3">
                {filteredAdmins.map((admin) => (
                  <li
                    key={admin._id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{admin.username}</strong>{" "}
                      {admin.isActive ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Disabled</span>
                      )}
                      <br />
                      <small>{admin.email}</small>
                      <br />
                      <em>{admin.company}</em>
                    </div>
                    <div>
                      <button
                        className={`btn btn-sm ${
                          admin.isActive
                            ? "btn-outline-warning"
                            : "btn-outline-success"
                        } me-2`}
                        onClick={() => handleToggleAdminStatus(admin)}
                      >
                        {admin.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEditAdmin(admin)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteAdmin(admin._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No admins found.</p>
            )}

            <form className="mt-4" onSubmit={handleSubmitAdmin}>
              <h4>{editId ? "Update Admin" : "Create New Admin"}</h4>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Admin Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Company Name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Admin Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder={
                    editId ? "New Password (optional)" : "Admin Password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editId}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                {editId ? "Update Admin" : "Create Admin"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
  