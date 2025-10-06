import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL =
  (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim()) ||
  "http://localhost:5000/api/employee";

const AttendanceDashboard = () => {
  const token = localStorage.getItem("token");
  const [attendance, setAttendance] = useState([]);

  // ✅ Fetch Attendance Data
  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${API_URL}/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(res.data.attendance || []);
    } catch (err) {
      console.error("❌ Attendance fetch error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // ---------- Attendance Graph (Day-wise) ----------
  const attendanceCountByDay = {};

  attendance.forEach((rec) => {
    if (!rec.punchIn) return;
    const dayKey = new Date(rec.punchIn).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
    attendanceCountByDay[dayKey] = 1; // Present = 1
  });

  const attendanceLabels = Object.keys(attendanceCountByDay);
  const attendanceValues = Object.values(attendanceCountByDay);

  const attendanceChartData = useMemo(
    () => ({
      labels: attendanceLabels,
      datasets: [
        {
          label: "Present (Days)",
          data: attendanceValues,
          backgroundColor: attendanceValues.map((v) =>
            v === 1 ? "rgba(40, 167, 69, 0.8)" : "rgba(220, 53, 69, 0.7)"
          ),
          borderRadius: 8,
        },
      ],
    }),
    [attendanceLabels, attendanceValues]
  );

  const attendanceOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Employee Day-wise Attendance",
        font: { size: 18, weight: "bold" },
        color: "#0f3460",
      },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const date = attendanceLabels[context.dataIndex];
            return `${date}: ${context.raw === 1 ? "Present ✅" : "Absent ❌"}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 1,
        ticks: { stepSize: 1, color: "#555" },
      },
      x: {
        ticks: {
          color: "#555",
          autoSkip: true,
          maxRotation: 50,
          minRotation: 30,
        },
      },
    },
  };

  // ✅ Render
  return (
    <div className="container my-4">
      <h2 className="text-center fw-bold mb-4" style={{ color: "#0f3460" }}>
        Employee Attendance Dashboard
      </h2>

      <div className="card shadow-sm border-0">
        <div className="card-body" style={{ height: "450px" }}>
          {attendanceLabels.length > 0 ? (
            <Bar data={attendanceChartData} options={attendanceOptions} />
          ) : (
            <p className="text-muted text-center">
              ⚠️ No attendance data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;
