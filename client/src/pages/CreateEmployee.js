import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const CreateEmployee = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null); // ✅ image state
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Generate Short Unique Employee ID
  const generateId = () =>
    `EMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  useEffect(() => {
    const fetchEmployee = async () => {
      if (id) {
        try {
          const res = await axios.get(`${API_URL}/api/admin/employees`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const emp = res.data.employees?.find((e) => e._id === id);

          if (emp) {
            setEmployeeId(emp.employeeId);
            setName(emp.name);
            setEmail(emp.email);
            setDepartment(emp.department || "");
            setPosition(emp.position || "");
            setSalary(emp.salary);
            setJoinDate(emp.joinDate ? emp.joinDate.split("T")[0] : "");
            setPassword("");
          }
        } catch (err) {
          console.error("❌ Fetch employee error:", err.response?.data || err.message);
        }
      } else {
        setEmployeeId(generateId());
      }
    };

    fetchEmployee();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ FormData for file upload
      const formData = new FormData();
      formData.append("employeeId", employeeId,);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("department", department);
      formData.append("position", position);
      formData.append("salary", salary);
      formData.append("joinDate", joinDate);
      if (password) formData.append("password", password);
      if (image) formData.append("image", image);

      if (id) {
        await axios.put(`${API_URL}/api/admin/employees/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("✅ Employee updated successfully");
      } else {
        await axios.post(`${API_URL}/api/admin/employees`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("✅ Employee created successfully");
      }

      navigate("/admin");
    } catch (err) {
      console.error("❌ Save Employee error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Failed to save employee");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="container mt-5">
  <h3>{id ? "Update Employee" : "Create New Employee"}</h3>
  <form className="mt-4" onSubmit={handleSubmit} encType="multipart/form-data">
    <div className="row g-3">
      {/* Employee ID */}
      <div className="col-md-6">
        <input
          type="text"
          className="form-control"
          value={employeeId}
          readOnly
        />
        <small className="text-muted">Employee ID (Auto-generated / Fixed)</small>
      </div>

      {/* Name */}
      <div className="col-md-6">
        <input
          type="text"
          className="form-control"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Email */}
      <div className="col-md-6">
        <input
          type="email"
          className="form-control"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Department */}
      <div className="col-md-6">
        <select
          className="form-control"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        >
          <option value="">Select Department</option>
          <option value="Engineering">Engineering</option>
          <option value="Human Resources">Human Resources</option>
          <option value="Finance">Finance</option>
          <option value="Design">Design</option>
          <option value="Sales">Sales</option>
          <option value="Support">Support</option>
        </select>
      </div>

      {/* Position */}
      <div className="col-md-6">
        <select
          className="form-control"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
        >
          <option value="">Select Position</option>
          <option value="Software Engineer">Software Engineer</option>
          <option value="HR Manager">HR Manager</option>
          <option value="Accountant">Accountant</option>
          <option value="Designer">Designer</option>
          <option value="Sales Executive">Sales Executive</option>
          <option value="Support Executive">Support Executive</option>
        </select>
      </div>

      {/* Salary */}
      <div className="col-md-6">
        <input
          type="number"
          className="form-control"
          placeholder="Salary"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          required
        />
      </div>

      {/* Join Date */}
      <div className="col-md-6">
        <input
          type="date"
          className="form-control"
          value={joinDate}
          onChange={(e) => setJoinDate(e.target.value)}
          required
        />
      </div>

      {/* Image Upload */}
      <div className="col-md-6">
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>

      {/* Password */}
      <div className="col-md-6">
        <input
          type="password"
          className="form-control"
          placeholder={id ? "Enter new password (optional)" : "Set password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required={!id}
        />
      </div>
    </div>

    {/* Submit Button full row */}
    <div className="row mt-4">
      <div className="col-12">
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Saving..." : id ? "Update Employee" : "Create Employee"}
        </button>
      </div>
    </div>
  </form>
</div>

  );
};

export default CreateEmployee;
