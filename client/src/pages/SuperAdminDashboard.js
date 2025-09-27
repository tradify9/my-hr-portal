import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  // Employee states
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empPosition, setEmpPosition] = useState("");
  const [empSalary, setEmpSalary] = useState("");
  const [empId, setEmpId] = useState(null);

  const [activePage, setActivePage] = useState("dashboard");

  const token = localStorage.getItem("token");
  const loggedInUser = localStorage.getItem("username");
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Fetch admins
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/superadmin/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data);
    } catch (err) {
      console.error("Fetch Admins Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/superadmin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch (err) {
      console.error("Fetch Employees Error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdmins();
      fetchEmployees();
    } else {
      navigate("/login"); // Redirect to login if no token
    }
  }, [token, navigate]);

  // Create or Update Admin
  const handleSubmitAdmin = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const res = await axios.put(
          `${API_URL}/api/superadmin/admins/${editId}`,
          { username, company, email, password },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAdmins(admins.map((a) => (a._id === editId ? res.data : a)));
        setEditId(null);
      } else {
        const res = await axios.post(
          `${API_URL}/api/superadmin/admins`,
          { username, company, email, password },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAdmins([...admins, res.data]);
      }
      setUsername("");
      setCompany("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Save Admin Error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Failed to save admin");
    }
  };

  // Delete Admin
  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await axios.delete(`${API_URL}/api/superadmin/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(admins.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Delete Admin Error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Failed to delete admin");
    }
  };

  // Edit Admin
  const handleEditAdmin = (admin) => {
    setEditId(admin._id);
    setUsername(admin.username || "");
    setCompany(admin.company || "");
    setEmail(admin.email || "");
    setPassword("");
    setActivePage("admins");
  };

  // Logout with confirmation
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      navigate("/");
    }
  };

  // Safe Search filter
  const safeSearch = search?.toLowerCase() || "";

  const filteredAdmins = admins.filter((a) => {
    const username = a.username?.toLowerCase() || "";
    const email = a.email?.toLowerCase() || "";
    const company = a.company?.toLowerCase() || "";

    return (
      username.includes(safeSearch) ||
      email.includes(safeSearch) ||
      company.includes(safeSearch)
    );
  });

  // Sidebar menu
  const menuItems = [
    { key: "dashboard", label: "📊 Dashboard" },
    { key: "admins", label: "👨‍💻 Manage Admins" },
    { key: "employees", label: "👷 Employees" },
    { key: "settings", label: "⚙️ Settings" },
    { key: "profile", label: "👤 Profile" },
  ];

  // Handle Employee Submit
  const handleSubmitEmployee = async (e) => {
    e.preventDefault();
    try {
      if (empId) {
        const res = await axios.put(
          `${API_URL}/api/superadmin/employees/${empId}`,
          {
            name: empName,
            email: empEmail,
            position: empPosition,
            salary: empSalary,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees(employees.map((e) => (e._id === empId ? res.data : e)));
        setEmpId(null);
      } else {
        const res = await axios.post(
          `${API_URL}/api/superadmin/employees`,
          {
            name: empName,
            email: empEmail,
            position: empPosition,
            salary: empSalary,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees([...employees, res.data]);
      }
      setEmpName("");
      setEmpEmail("");
      setEmpPosition("");
      setEmpSalary("");
    } catch (err) {
      console.error("Save Employee Error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Failed to save employee");
    }
  };

  // Edit Employee
  const handleEditEmployee = (emp) => {
    setEmpId(emp._id);
    setEmpName(emp.name);
    setEmpEmail(emp.email);
    setEmpPosition(emp.position);
    setEmpSalary(emp.salary);
    setActivePage("employees");
  };

  // Delete Employee
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;
    try {
      await axios.delete(`${API_URL}/api/superadmin/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(employees.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Delete Employee Error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-3 p-0">
          <div className="bg-dark text-light vh-100 p-3">
            <h4 className="text-center mb-4">Super Admin</h4>
            <ul className="nav flex-column">
              {menuItems.map((item) => (
                <li className="nav-item mb-2" key={item.key}>
                  <button
                    className={`btn w-100 text-start ${
                      activePage === item.key ? "btn-secondary" : "btn-dark"
                    }`}
                    onClick={() => setActivePage(item.key)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <hr />
            <div className="text-center">
              {loggedInUser && <div className="mb-2">👤 {loggedInUser}</div>}
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="col-9 p-4">
          {activePage === "dashboard" && (
            <div>
              <h2>📊 Dashboard</h2>
              <p>Welcome back, {loggedInUser}!</p>
              <p>Total Admins: {admins.length}</p>
              <p>Total Employees: {employees.length}</p>
            </div>
          )}

          {activePage === "admins" && (
            <div>
              <h2>👨‍💻 Manage Admins</h2>
              {/* Search */}
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by username, email, or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <small className="text-muted">
                  Found {filteredAdmins.length} admins
                </small>
              </div>

              {/* List */}
              {loading ? (
                <p>Loading admins...</p>
              ) : filteredAdmins.length > 0 ? (
                <ul className="list-group">
                  {filteredAdmins.map((admin) => (
                    <li
                      key={admin._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{admin.username}</strong> <br />
                        <small>{admin.email}</small> <br />
                        <em>{admin.company}</em>
                      </div>
                      <div>
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

              {/* Form */}
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
                {editId && (
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => {
                      setEditId(null);
                      setUsername("");
                      setCompany("");
                      setEmail("");
                      setPassword("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>
          )}

          {activePage === "employees" && (
            <div>
              <h2>👷 Employees</h2>

              {/* List */}
              {employees.length > 0 ? (
                <ul className="list-group mb-4">
                  {employees.map((emp) => (
                    <li
                      key={emp._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{emp.name}</strong> <br />
                        <small>{emp.email}</small> <br />
                        <em>{emp.position}</em> – 💰 {emp.salary}
                      </div>
                      <div>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEditEmployee(emp)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteEmployee(emp._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No employees found.</p>
              )}

              {/* Form */}
              <form className="mt-4" onSubmit={handleSubmitEmployee}>
                <h4>{empId ? "Update Employee" : "Create New Employee"}</h4>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Full Name"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Employee Email"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Position"
                    value={empPosition}
                    onChange={(e) => setEmpPosition(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Salary"
                    value={empSalary}
                    onChange={(e) => setEmpSalary(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success">
                  {empId ? "Update Employee" : "Create Employee"}
                </button>
                {empId && (
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => {
                      setEmpId(null);
                      setEmpName("");
                      setEmpEmail("");
                      setEmpPosition("");
                      setEmpSalary("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>
          )}

          {activePage === "settings" && (
            <div>
              <h2>⚙️ Settings</h2>
              <p>Here you can manage application settings.</p>
            </div>
          )}

          {activePage === "profile" && (
            <div>
              <h2>👤 Profile</h2>
              <p>Welcome, {loggedInUser}</p>
              <p>Email: {email || "Not available"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;