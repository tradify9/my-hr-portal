import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./AttendanceLeaveDashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL =
  (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim()) ||
  "http://localhost:5000/api/employee";

const AttendanceLeaveDashboard = () => {
  const token = localStorage.getItem("token");
  const [attendance, setAttendance] = useState([]);
  const [selectedRange, setSelectedRange] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  // ✅ Get all attendance dates (for calendar highlight)
  const attendanceDates = useMemo(() => {
    const set = new Set();
    attendance.forEach((rec) => {
      if (rec.punchIn) {
        const day = new Date(rec.punchIn).toISOString().split("T")[0];
        set.add(day);
      }
    });
    return set;
  }, [attendance]);

  // ✅ Date helpers
  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const endOfDay = (d) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  };

  // ✅ Filter attendance based on selected range
  const filteredAttendance = useMemo(() => {
    if (!selectedRange) return attendance;
    if (selectedRange instanceof Date) {
      const s = startOfDay(selectedRange).getTime();
      const e = endOfDay(selectedRange).getTime();
      return attendance.filter((rec) => {
        if (!rec.punchIn) return false;
        const t = new Date(rec.punchIn).getTime();
        return t >= s && t <= e;
      });
    }
    if (Array.isArray(selectedRange) && selectedRange.length === 2) {
      const s = startOfDay(selectedRange[0]).getTime();
      const e = endOfDay(selectedRange[1]).getTime();
      return attendance.filter((rec) => {
        if (!rec.punchIn) return false;
        const t = new Date(rec.punchIn).getTime();
        return t >= s && t <= e;
      });
    }
    return attendance;
  }, [attendance, selectedRange]);

  // ✅ Calculate working hours (using punchIn, punchOut, current time)
  const hoursByDay = useMemo(() => {
    const map = {};

    filteredAttendance.forEach((rec) => {
      if (!rec.punchIn) return;

      const punchIn = new Date(rec.punchIn);
      const punchOut = rec.punchOut ? new Date(rec.punchOut) : null;
      const dayKey = punchIn.toLocaleDateString("en-IN");

      let workedHours = 0;
      if (punchOut) {
        workedHours = (punchOut - punchIn) / (1000 * 60 * 60);
      } else {
        // If no punch-out, calculate live difference from current time
        workedHours = (currentTime - punchIn) / (1000 * 60 * 60);
      }

      map[dayKey] = (map[dayKey] || 0) + workedHours;
    });

    const sorted = Object.entries(map).sort(
      (a, b) =>
        new Date(a[0].split("/").reverse().join("-")) -
        new Date(b[0].split("/").reverse().join("-"))
    );

    return {
      labels: sorted.map((e) => e[0]),
      values: sorted.map((e) => parseFloat(e[1].toFixed(2))),
    };
  }, [filteredAttendance, currentTime]);

  // ✅ Chart Data
  const chartData = {
    labels: hoursByDay.labels,
    datasets: [
      {
        label: "Working Hours (Live)",
        data: hoursByDay.values,
        backgroundColor: "#0f3460",
        borderRadius: 6,
      },
    ],
  };

  // ✅ Chart Options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "bottom" },
      title: {
        display: true,
        text: "Real-Time Working Hours Overview",
        color: "#0f3460",
        font: { size: 16, weight: "600" },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Hours", color: "#0f3460" },
      },
      x: {
        ticks: { color: "#0f3460" },
      },
    },
  };

  // ✅ Time formatting
  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // ✅ Range Filters
  const applyToday = () => setSelectedRange(new Date());
  const applyLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    setSelectedRange([start, end]);
  };
  const applyThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setSelectedRange([start, end]);
  };
  const clearSelection = () => setSelectedRange(null);

  // ✅ Calendar tile colors
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dayStr = date.toISOString().split("T")[0];
      if (attendanceDates.has(dayStr)) {
        return "tile-present";
      } else if (date < new Date()) {
        return "tile-absent";
      }
    }
    return null;
  };

  return (
    <div className="attendance-dashboard-container">
      <div className="dashboard-inner">
        {/* 🌟 Header with Live Time */}
        <div className="dashboard-header">
          <div>
            <h2 className="attendance-heading">Employee Attendance Dashboard</h2>
          </div>
          <div className="clock-card">
            <div className="clock-time">{formattedTime}</div>
            <div className="clock-date">{formattedDate}</div>
          </div>
        </div>

        {/* Content */}
        <div className="row-layout">
          <div className="chart-section">
            <div className="preset-buttons">
              <button className="preset-button" onClick={applyToday}>
                Today
              </button>
              <button className="preset-button" onClick={applyLast7Days}>
                Last 7 Days
              </button>
              <button className="preset-button" onClick={applyThisMonth}>
                This Month
              </button>
              <button className="preset-button clear" onClick={clearSelection}>
                Clear
              </button>
            </div>

            <div className="attendance-card">
              <div className="chart-box">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="calendar-section">
            <div className="calendar-card">
              <h4 className="calendar-title">Attendance Calendar</h4>
              <Calendar
                onChange={setSelectedRange}
                value={selectedRange}
                selectRange={true}
                locale="en-IN"
                tileClassName={tileClassName}
              />
              <div className="calendar-legend">
                <span className="legend-item">
                  <span className="legend-color present"></span> Present
                </span>
                <span className="legend-item">
                  <span className="legend-color absent"></span> Absent
                </span>
                <span className="legend-item">
                  <span className="legend-color future"></span> Future
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLeaveDashboard;
