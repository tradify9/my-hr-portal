import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./PunchInOut.css";

const PunchInOut = () => {
  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const [status, setStatus] = useState("loading");
  const [attendance, setAttendance] = useState([]);
  const [value, setValue] = useState(new Date());

  // ✅ Utility: format local date "YYYY-MM-DD"
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ✅ Fetch Attendance
  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/employee/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const att = res.data.attendance || [];
      setAttendance(att);

      // ✅ check today's status
      const today = formatDate(new Date());
      const todayRec = att.find(
        (rec) => rec.punchIn && formatDate(new Date(rec.punchIn)) === today
      );

      if (!todayRec) {
        setStatus("none");
      } else if (todayRec.punchIn && !todayRec.punchOut) {
        setStatus("punchedIn");
      } else {
        setStatus("punchedOut");
      }
    } catch (err) {
      console.error("Attendance fetch error:", err.response?.data || err.message);
      setAttendance([]);
      setStatus("none");
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // ✅ Get Location
  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject("Geolocation not supported");
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        (err) => reject(err.message)
      );
    });

  // ✅ Punch In
  const handlePunchIn = async () => {
    try {
      const loc = await getLocation();
      const res = await axios.post(
        `${API_URL}/api/employee/punch-in`,
        { latitude: loc.latitude, longitude: loc.longitude },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newRecord = res.data.attendance;

      alert("✅ Punched In at " + new Date(newRecord.punchIn).toLocaleTimeString());

      setAttendance((prev) => [...prev, newRecord]);
      setStatus("punchedIn");
    } catch (err) {
      console.error("PunchIn error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Punch In failed");
    }
  };

  // ✅ Punch Out
  const handlePunchOut = async () => {
    try {
      const loc = await getLocation();
      const res = await axios.post(
        `${API_URL}/api/employee/punch-out`,
        { latitude: loc.latitude, longitude: loc.longitude },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedRecord = res.data.attendance;

      alert("✅ Punched Out at " + new Date(updatedRecord.punchOut).toLocaleTimeString());

      setAttendance((prev) =>
        prev.map((rec) =>
          rec._id === updatedRecord._id ? updatedRecord : rec
        )
      );
      setStatus("punchedOut");
    } catch (err) {
      console.error("PunchOut error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Punch Out failed");
    }
  };

  // ✅ Highlight Calendar (fixed)
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = formatDate(date);
      const todayStr = formatDate(new Date());

      const dateOnly = new Date(dateStr).setHours(0, 0, 0, 0);
      const todayOnly = new Date(todayStr).setHours(0, 0, 0, 0);

      // ✅ Present day check
      const record = attendance.find(
        (rec) => rec.punchIn && formatDate(new Date(rec.punchIn)) === dateStr
      );
      if (record) {
        return "present-day"; // 🟢 Present
      }

      // ✅ Past absent
      if (dateOnly < todayOnly) {
        return "absent-day"; // 🔴 Absent
      }

      // ✅ Today without punch & Future → Neutral
      return null;
    }
    return null;
  };

  if (status === "loading") {
    return <p>Checking status...</p>;
  }

  return (
    <div className="punch-container my-4">
      {/* Punch Buttons */}
      <div className="button-group mb-4">
        <button
          className="btn btn-success me-3"
          onClick={handlePunchIn}
          disabled={status !== "none"}
        >
          Punch In
        </button>
        <button
          className="btn btn-danger"
          onClick={handlePunchOut}
          disabled={status !== "punchedIn"}
        >
          Punch Out
        </button>
        {status === "punchedOut" && (
          <p className="text-muted mt-2 mb-0 small">✅ Already punched today.</p>
        )}
      </div>

      {/* Calendar */}
      <div className="calendar-card shadow-lg p-4 rounded-4">
        <h5 className="fw-bold text-primary mb-3">Attendance</h5>
        <Calendar
          value={value}
          onChange={setValue}
          tileClassName={tileClassName}
        />
        <div className="legend mt-3">
          <span className="badge bg-success me-2">Present</span>
          <span className="badge bg-danger me-2">Absent</span>
        </div>
      </div>
    </div>
  );
};

export default PunchInOut;
