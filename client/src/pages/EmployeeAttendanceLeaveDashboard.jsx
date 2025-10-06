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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL =
  (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim()) ||
  "http://localhost:5000/api/employee"; // ✅ correct backend base

const EmployeeAttendanceDashboard = () => {
  const token = localStorage.getItem("token");
  const [attendance, setAttendance] = useState([]);

  // ✅ Fetch Attendance Data
  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${API_URL}/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Attendance fetched:", res.data);
      setAttendance(res.data.attendance || res.data || []);
    } catch (err) {
      console.error("❌ Attendance fetch error:", err.response?.data || err.message);
      setAttendance([]);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // ---------- Date Range ----------
  const allPunchDates = attendance
    .filter((rec) => rec.punchIn)
    .map((rec) => new Date(rec.punchIn));

  let startDate = new Date();
  let endDate = new Date();

  if (allPunchDates.length > 0) {
    const minDate = Math.min(...allPunchDates);
    const maxDate = Math.max(...allPunchDates);
    startDate = new Date(minDate);
    endDate = new Date(maxDate);
  }

  // ✅ Generate all dates between start and end
  const dateRange = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dateRange.push(new Date(d));
  }

  // ---------- Attendance Day-wise ----------
  const presentDays = new Set(
    attendance
      .filter((rec) => rec.punchIn)
      .map((rec) => new Date(rec.punchIn).toDateString())
  );

  // ✅ Day-wise label like: "Mon, 06 Oct"
  const attendanceLabels = dateRange.map((d) =>
    d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
  );

  const attendanceValues = dateRange.map((d) =>
    presentDays.has(d.toDateString()) ? 1 : 0
  );

  // ✅ Chart Data
  const attendanceChartData = useMemo(
    () => ({
      labels: attendanceLabels,
      datasets: [
        {
          label: "Attendance (1 = Present, 0 = Absent)",
          data: attendanceValues,
          backgroundColor: attendanceValues.map((v) =>
            v === 1 ? "rgba(40, 167, 69, 0.8)" : "rgba(220, 53, 69, 0.7)"
          ),
          borderRadius: 6,
        },
      ],
    }),
    [attendanceLabels, attendanceValues]
  );

  // ✅ Chart Options
  const attendanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Employee Attendance (Day-wise)",
        color: "#0f3460",
        font: { size: 18, weight: "bold" },
      },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const date = dateRange[context.dataIndex];
            const formatted = date.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
            return `${formatted}: ${
              context.raw === 1 ? "Present ✅" : "Absent ❌"
            }`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#555",
          autoSkip: true,
          maxRotation: 60,
          minRotation: 30,
          font: { size: 12 },
        },
      },
      y: {
        min: 0,
        max: 1,
        ticks: {
          stepSize: 1,
          color: "#555",
        },
        grid: {
          color: "rgba(200,200,200,0.2)",
        },
      },
    },
  };

  // ✅ Render
  return (
    <div className="container my-5">
      <h2 className="text-center fw-bold mb-4" style={{ color: "#0f3460" }}>
        Employee Attendance Dashboard
      </h2>

      <div className="card shadow border-0">
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

export default EmployeeAttendanceDashboard;
