import React, { useEffect, useState } from "react";
import axios from "axios";

const PunchInOut = () => {
  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const [status, setStatus] = useState("loading");

  // ✅ Check today's attendance
  const checkTodayStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/employee/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const today = new Date().toDateString();
      const todayRecord = res.data.attendance.find((rec) => {
        return new Date(rec.punchIn).toDateString() === today;
      });

      if (!todayRecord) {
        setStatus("none");
      } else if (todayRecord.punchIn && !todayRecord.punchOut) {
        setStatus("punchedIn");
      } else if (todayRecord.punchIn && todayRecord.punchOut) {
        setStatus("punchedOut");
      }
    } catch (err) {
      console.error("Check Today Status Error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    checkTodayStatus();
  }, []);

  // ✅ Get location
  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => reject(err.message)
      );
    });

  const handlePunchIn = async () => {
    try {
      const location = await getLocation();

      const res = await axios.post(
        `${API_URL}/api/employee/punch-in`,
        { location },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(
        "✅ Punched In at " +
          new Date(res.data.attendance.punchIn).toLocaleTimeString()
      );
      setStatus("punchedIn");
    } catch (err) {
      console.error("Punch In Error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Punch In failed");
    }
  };

  const handlePunchOut = async () => {
    try {
      const location = await getLocation();

      const res = await axios.post(
        `${API_URL}/api/employee/punch-out`,
        { location },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(
        "✅ Punched Out at " +
          new Date(res.data.attendance.punchOut).toLocaleTimeString()
      );
      setStatus("punchedOut");
    } catch (err) {
      console.error("Punch Out Error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Punch Out failed");
    }
  };

  if (status === "loading") {
    return <p>⏳ Checking punch status...</p>;
  }

  return (
    <div className="my-3">
      <button
        className="btn btn-success me-2"
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
        <p className="text-muted mt-2">
          ✅ You have already completed punch in/out for today.
        </p>
      )}
    </div>
  );
};

export default PunchInOut;
