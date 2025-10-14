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
  const [todayRecord, setTodayRecord] = useState(null);
  const [isPunching, setIsPunching] = useState(false);

  // ✅ Always ensure data is an array
  const ensureArray = (data) =>
    Array.isArray(data) ? data : data ? [data] : [];

  // ✅ Convert Date → YYYY-MM-DD
  const toLocalDateString = (dateInput) => {
    const d = new Date(dateInput);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const todayStr = toLocalDateString(new Date());

  // ✅ Get user location (optional)
  const getLocation = async () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        return resolve({ latitude: null, longitude: null });
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => resolve({ latitude: null, longitude: null })
      );
    });
  };

  // ✅ Fetch Attendance
  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/employee/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const records = ensureArray(res.data.attendance);

      // Auto punch-out if yesterday incomplete
      if (records.length) {
        const last = records[records.length - 1];
        const lastDate = toLocalDateString(last.punchIn);
        if (lastDate !== todayStr && !last.punchOut) {
          try {
            await axios.post(
              `${API_URL}/api/employee/auto-punch-out`,
              { recordId: last._id },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("✅ Auto punch-out done for previous day");
          } catch (err) {
            console.error("Auto punch-out failed:", err.message);
          }
        }
      }

      const todayRec = records.find(
        (rec) => toLocalDateString(rec.punchIn) === todayStr
      );

      setAttendance(records);
      setTodayRecord(todayRec || null);

      if (!todayRec) setStatus("none");
      else if (todayRec && !todayRec.punchOut) setStatus("punchedIn");
      else setStatus("punchedOut");
    } catch (err) {
      console.error("Fetch Attendance Error:", err.message);
      setAttendance([]); // ensure it's always an array
      setStatus("none");
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // ✅ Auto-refresh at midnight
  useEffect(() => {
    const now = new Date();
    const millisTillMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5) -
      now;
    const timer = setTimeout(fetchAttendance, millisTillMidnight);
    return () => clearTimeout(timer);
  }, [attendance]);

  // ✅ Punch In
  const handlePunchIn = async () => {
    if (status === "punchedIn")
      return alert("⚠️ Already punched in today!");
    if (status === "punchedOut")
      return alert("✅ You've already completed today's attendance.");

    setIsPunching(true);
    try {
      const loc = await getLocation();
      const res = await axios.post(
        `${API_URL}/api/employee/punch-in`,
        { latitude: loc.latitude, longitude: loc.longitude },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedAttendance = ensureArray(res.data.attendance);
      setAttendance(updatedAttendance);

      const todayRec = updatedAttendance.find(
        (rec) => toLocalDateString(rec.punchIn) === todayStr
      );
      setTodayRecord(todayRec || null);

      setStatus("punchedIn");
      alert("✅ Punched In successfully!");
    } catch (err) {
      console.error("Punch In Error:", err.message);
      alert(err.response?.data?.msg || "Punch In failed.");
    } finally {
      setIsPunching(false);
    }
  };

  // ✅ Punch Out
  const handlePunchOut = async () => {
    if (status !== "punchedIn" || isPunching)
      return alert("⚠️ Please punch in first before punching out.");

    setIsPunching(true);
    try {
      const loc = await getLocation();
      const res = await axios.post(
        `${API_URL}/api/employee/punch-out`,
        { latitude: loc.latitude, longitude: loc.longitude },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedAttendance = ensureArray(res.data.attendance);
      setAttendance(updatedAttendance);

      const todayRec = updatedAttendance.find(
        (rec) => toLocalDateString(rec.punchIn) === todayStr
      );
      setTodayRecord(todayRec || null);

      setStatus("punchedOut");
      alert("✅ Punched Out successfully!");
    } catch (err) {
      console.error("Punch Out Error:", err.message);
      alert(err.response?.data?.msg || "Punch Out failed.");
    } finally {
      setIsPunching(false);
    }
  };

  // ✅ Calendar highlight
  const tileClassName = ({ date, view }) => {
    if (view === "month" && Array.isArray(attendance)) {
      const dateStr = toLocalDateString(date);
      const rec = attendance.find(
        (r) => r.punchIn && toLocalDateString(r.punchIn) === dateStr
      );
      if (rec) return "present-day";
      const today = toLocalDateString(new Date());
      if (dateStr < today) return "absent-day";
    }
    return null;
  };

  if (status === "loading") return <p>Checking attendance...</p>;

  return (
    <div className="punch-container my-4 text-center">
      {/* ✅ Buttons */}
      <div className="button-group mb-4">
        <button
          className="btn btn-success me-3"
          onClick={handlePunchIn}
          disabled={isPunching || status === "punchedIn" || status === "punchedOut"}
        >
          {isPunching ? "Punching In..." : "Punch In"}
        </button>
        <button
          className="btn btn-danger"
          onClick={handlePunchOut}
          disabled={isPunching || status !== "punchedIn"}
        >
          {isPunching ? "Punching Out..." : "Punch Out"}
        </button>
      </div>

      {/* ✅ Today's Record */}
      {todayRecord && (
        <div className="bg-light p-3 rounded-3 mb-3 shadow-sm">
          <p className="mb-1">
            <strong>Punch In:</strong>{" "}
            {new Date(todayRecord.punchIn).toLocaleTimeString()}
          </p>
          <p className="mb-0">
            <strong>Punch Out:</strong>{" "}
            {todayRecord.punchOut
              ? new Date(todayRecord.punchOut).toLocaleTimeString()
              : "— Not yet —"}
          </p>
        </div>
      )}

      {/* ✅ Calendar */}
      <div className="calendar-card shadow-lg p-4 rounded-4">
        <h5 className="fw-bold text-primary mb-3">Attendance Calendar</h5>
        <Calendar value={new Date()} tileClassName={tileClassName} />
        <div className="legend mt-3">
          <span className="badge bg-success me-2">Present</span>
          <span className="badge bg-danger me-2">Absent</span>
        </div>
      </div>
    </div>
  );
};

export default PunchInOut;
