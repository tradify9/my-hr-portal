import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./EmployeeAttendance.css"; // ✅ custom CSS

const EmployeeAttendance = () => {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("name");
  const userEmail = localStorage.getItem("email");

  const API_URL =
    (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim()) ||
    "http://localhost:5000";

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState(""); // ✅ search box state
  const [filteredAttendance, setFilteredAttendance] = useState([]);

  // ✅ Fetch Attendance
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/employee/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(res.data?.attendance || []);
      setFilteredAttendance(res.data?.attendance || []);
    } catch (err) {
      console.error("❌ Fetch Attendance error:", err.response?.data || err.message);
      setAttendance([]);
      setFilteredAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // ✅ Search Logic (filter by email)
  useEffect(() => {
    if (!searchEmail.trim()) {
      setFilteredAttendance(attendance);
    } else {
      setFilteredAttendance(
        attendance.filter((record) =>
          (record.userId?.email || "").toLowerCase().includes(searchEmail.toLowerCase())
        )
      );
    }
  }, [searchEmail, attendance]);

  // ✅ Present Dates Array
  const presentDates = filteredAttendance
    .filter((record) => record.punchIn)
    .map((record) => new Date(record.punchIn).toDateString());

  // ✅ CSV Download Function
  const downloadCSV = () => {
    if (!filteredAttendance.length) {
      alert("⚠️ No data available to download!");
      return;
    }

    const headers = [
      "Employee",
      "Email",
      "Punch In Time",
      "Punch In Location",
      "Punch Out Time",
      "Punch Out Location",
    ];

    const rows = filteredAttendance.map((record) => [
      record.userId?.name || userName || "Unknown",
      record.userId?.email || userEmail || "—",
      record.punchIn ? new Date(record.punchIn).toLocaleString("en-IN") : "—",
      record.punchInLocation
        ? `${record.punchInLocation.latitude}, ${record.punchInLocation.longitude}`
        : "—",
      record.punchOut ? new Date(record.punchOut).toLocaleString("en-IN") : "—",
      record.punchOutLocation
        ? `${record.punchOutLocation.latitude}, ${record.punchOutLocation.longitude}`
        : "—",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `attendance_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ Helper: Convert lat/long to Google Maps link
  const renderLocation = (location) => {
    if (!location || !location.latitude || !location.longitude) return "—";
    const { latitude, longitude } = location;
    const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    return (
      <a href={mapUrl} target="_blank" rel="noopener noreferrer">
        {latitude}, {longitude}
      </a>
    );
  };

  return (
    <div className="container mt-4">
      <h2>Employee Attendance Calendar</h2>

      {/* ✅ Search Box */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="🔍 Search by Email"
          className="form-control"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
      </div>

      {loading ? (
        <p> Loading...</p>
      ) : (
        <div className="calendar-wrapper">
          <Calendar
            tileClassName={({ date }) => {
              const dateStr = date.toDateString();
              if (presentDates.includes(dateStr)) {
                return "present-day"; // ✅ present
              }
              if (date < new Date()) {
                return "absent-day"; // ❌ absent
              }
              return "";
            }}
          />
        </div>
      )}

      {/* ✅ Download CSV Button */}
      <div className="mt-3">
        <button className="btn btn-success" onClick={downloadCSV}>
          ⬇️ Download CSV
        </button>
      </div>

      {/* ✅ Table with Punch In/Out + Location */}
      <div className="mt-4">
        <h5>Detailed Records</h5>
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>Punch In</th>
              <th>Punch In Location</th>
              <th>Punch Out</th>
              <th>Punch Out Location</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.length ? (
              filteredAttendance.map((record) => (
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
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  ⚠️ No records found for this email
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
