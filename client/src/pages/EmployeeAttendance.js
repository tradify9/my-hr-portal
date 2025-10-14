import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./EmployeeAttendance.css";

const EmployeeAttendance = () => {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("name");
  const userEmail = localStorage.getItem("email");

  const API_URL =
    (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim()) ||
    "http://localhost:5000";

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  useEffect(() => {
    let filtered = attendance;

    if (searchEmail.trim()) {
      filtered = filtered.filter((record) =>
        (record.userId?.email || "")
          .toLowerCase()
          .includes(searchEmail.toLowerCase())
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.punchIn || record.punchOut);
        return recordDate >= start && recordDate <= end;
      });
    }

    setFilteredAttendance(filtered);
  }, [searchEmail, startDate, endDate, attendance]);

  const presentDates = filteredAttendance
    .filter((record) => record.punchIn)
    .map((record) => new Date(record.punchIn).toDateString());

  const groupedByMonth = filteredAttendance.reduce((acc, record) => {
    const date = new Date(record.punchIn || record.punchOut);
    if (!isNaN(date)) {
      const key = `${date.toLocaleString("default", { month: "long" })}-${date.getFullYear()}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(record);
    }
    return acc;
  }, {});

  const createCSV = (data) => {
    const headers = [
      "Employee",
      "Email",
      "Punch In Time",
      "Punch In Location",
      "Punch Out Time",
      "Punch Out Location",
      "Total Hours Worked",
    ];

    const rows = data.map((record) => [
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
      calculateWorkingHours(record.punchIn, record.punchOut),
    ]);

    return (
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n")
    );
  };

  const downloadCSVByMonth = (monthKey) => {
    const data = groupedByMonth[monthKey];
    if (!data || !data.length) {
      alert(`⚠️ No data for ${monthKey}`);
      return;
    }
    const csvContent = createCSV(data);
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `attendance_${monthKey}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadFilteredCSV = () => {
    if (!filteredAttendance.length) {
      alert("⚠️ No filtered data available!");
      return;
    }
    const csvContent = createCSV(filteredAttendance);
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `attendance_filtered_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ NEW: Function to calculate total working hours
  const calculateWorkingHours = (punchIn, punchOut) => {
    if (!punchIn || !punchOut) return "—";
    const diffMs = new Date(punchOut) - new Date(punchIn);
    if (diffMs <= 0) return "—";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const renderLocation = (location) => {
    if (!location?.latitude || !location?.longitude) return "—";
    return (
      <a
        href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {location.latitude}, {location.longitude}
      </a>
    );
  };

  return (
    <div className="attendance-container">
      <h2 className="attendance-title">📊 Employee Attendance Dashboard</h2>

      {/* ✅ Filters Section */}
      <div className="filters-container row g-3 mb-4">
        <div className="col-md-4 col-sm-12">
          <label className="form-label fw-semibold">Search by Email</label>
          <input
            type="text"
            placeholder="e.g. employee@company.com"
            className="form-control"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
        </div>
        <div className="col-md-3 col-6">
          <label className="form-label fw-semibold">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-3 col-6">
          <label className="form-label fw-semibold">End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="col-md-2 col-12">
          <button className="btn btn-success w-100" onClick={downloadFilteredCSV}>
            ⬇️ Export
          </button>
        </div>
      </div>

      {/* ✅ Calendar */}
      {loading ? (
        <p className="text-center text-muted">Loading attendance...</p>
      ) : (
        <div className="calendar-wrapper">
          <Calendar
            className="attendance-calendar shadow-sm"
            tileClassName={({ date }) => {
              const dateStr = date.toDateString();
              if (presentDates.includes(dateStr)) return "present-day";
              if (date < new Date()) return "absent-day";
              return "";
            }}
          />
        </div>
      )}

      {/* ✅ Month Download Buttons */}
      <div className="month-download-section text-center">
        <h5 className="fw-bold mb-3">📅 Download Attendance by Month</h5>
        {Object.keys(groupedByMonth).length ? (
          Object.keys(groupedByMonth).map((monthKey) => (
            <button
              key={monthKey}
              className="btn btn-primary m-2"
              onClick={() => downloadCSVByMonth(monthKey)}
            >
              ⬇️ {monthKey}
            </button>
          ))
        ) : (
          <p className="text-muted">No monthly data available</p>
        )}
      </div>

      {/* ✅ Detailed Table */}
      <div className="attendance-table-wrapper mt-4">
        <h5 className="fw-bold mb-3">Detailed Attendance Records</h5>
        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-primary">
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Punch In</th>
                <th>Punch In Location</th>
                <th>Punch Out</th>
                <th>Punch Out Location</th>
                <th>Total Hours</th>
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
                    <td className="fw-semibold text-success">
                      {calculateWorkingHours(record.punchIn, record.punchOut)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    ⚠️ No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance; 
   