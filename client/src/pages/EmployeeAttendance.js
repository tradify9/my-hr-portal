import React, { useEffect, useState } from "react";
import axios from "axios";

const EmployeeAttendance = () => {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("name");   // 👈 login ke time save karna hoga
  const userEmail = localStorage.getItem("email"); // 👈 login ke time save karna hoga

  const API_URL =
    (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim()) ||
    "http://localhost:5000";

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // ✅ Fetch Attendance
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/employee/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(res.data?.attendance || []);
    } catch (err) {
      console.error("❌ Fetch Attendance error:", err.response?.data || err.message);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // ✅ Search filter (admin case me kaam aayega)
  const filtered = attendance.filter(
    (record) =>
      record.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      record.userId?.email?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Render location
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
    <div className="container mt-4">
      <h2>📍 Employee Attendance</h2>

      {/* Search (sirf admin ke liye useful) */}
      <input
        type="text"
        className="form-control my-3"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>⏳ Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted">No attendance records found.</p>
      ) : (
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>Punch In</th>
              <th>In Location</th>
              <th>Punch Out</th>
              <th>Out Location</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr key={record._id}>
                <td>{record.userId?.name || userName || "Unknown"}</td>
                <td>{record.userId?.email || userEmail || "—"}</td>
                <td>
                  {record.punchIn
                    ? new Date(record.punchIn).toLocaleString("en-IN")
                    : "—"}
                </td>
                <td>{renderLocation(record.punchInLocation)}</td>
                <td>
                  {record.punchOut
                    ? new Date(record.punchOut).toLocaleString("en-IN")
                    : "—"}
                </td>
                <td>{renderLocation(record.punchOutLocation)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmployeeAttendance;
