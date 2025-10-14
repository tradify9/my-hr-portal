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
import "./CalendarAttendance.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL =
  (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim()) ||
  "http://localhost:5000/api/employee";

const EmployeeAttendanceDashboard = () => {
  const token = localStorage.getItem("token");
  const [attendance, setAttendance] = useState([]);
  const [filterRange, setFilterRange] = useState("today");
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayHours, setTodayHours] = useState(0);

  // ✅ Auto update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Fetch attendance data
  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${API_URL}/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(res.data.attendance || res.data || []);
    } catch (err) {
      console.error("❌ Attendance fetch error:", err.response?.data || err.message);
      setAttendance([]);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // ✅ Calculate today's working hours (real-time)
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayRecords = attendance.filter((rec) => {
      const inDate = new Date(rec.punchIn).toISOString().split("T")[0];
      return inDate === todayStr;
    });

    if (todayRecords.length > 0) {
      const record = todayRecords[0];
      const punchIn = new Date(record.punchIn);
      const punchOut = record.punchOut ? new Date(record.punchOut) : currentTime;
      const diffHrs = (punchOut - punchIn) / (1000 * 60 * 60);
      setTodayHours(diffHrs > 0 ? diffHrs.toFixed(2) : 0);
    } else {
      setTodayHours(0);
    }
  }, [attendance, currentTime]);

  // ✅ Filter Attendance Data
  const filteredAttendance = useMemo(() => {
    const now = new Date();
    let start;
    if (filterRange === "today") {
      start = new Date(now.setHours(0, 0, 0, 0));
    } else if (filterRange === "7days") {
      start = new Date();
      start.setDate(start.getDate() - 6);
    } else {
      start = new Date();
      start.setMonth(start.getMonth() - 1);
    }

    return attendance.filter(
      (rec) =>
        new Date(rec.punchIn) >= start && new Date(rec.punchIn) <= new Date()
    );
  }, [attendance, filterRange]);

  // ✅ Calculate hours per day
  const dayHoursMap = {};
  filteredAttendance.forEach((rec) => {
    const punchIn = new Date(rec.punchIn);
    const punchOut = rec.punchOut ? new Date(rec.punchOut) : null;
    const key = punchIn.toDateString();

    // If today & no punch out → count live time
    if (!punchOut && key === new Date().toDateString()) {
      const liveHours = (currentTime - punchIn) / (1000 * 60 * 60);
      dayHoursMap[key] = liveHours;
    } else if (punchOut) {
      const hours = (punchOut - punchIn) / (1000 * 60 * 60);
      dayHoursMap[key] = (dayHoursMap[key] || 0) + hours;
    }
  });

  // ✅ Graph Data
  const dateRange = Object.keys(dayHoursMap).map((d) => new Date(d));
  const attendanceLabels =
    filterRange === "today"
      ? ["Today"]
      : dateRange.map((d) =>
          d.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
          })
        );
  const attendanceValues =
    filterRange === "today"
      ? [parseFloat(todayHours)]
      : dateRange.map((d) => parseFloat(dayHoursMap[d.toDateString()]?.toFixed(2)) || 0);

  const attendanceChartData = useMemo(
    () => ({
      labels: attendanceLabels,
      datasets: [
        {
          label: "Working Hours",
          data: attendanceValues,
          backgroundColor: "#0f3460",
          borderRadius: 6,
        },
      ],
    }),
    [attendanceLabels, attendanceValues]
  );

  // ✅ Graph Options
  const attendanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text:
          filterRange === "today"
            ? "Today's Real-Time Working Hours"
            : filterRange === "7days"
            ? "Last 7 Days Working Hours"
            : "Last 1 Month Working Hours",
        color: "#0f3460",
        font: { size: 18, weight: "bold" },
      },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw.toFixed(2)} hours`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Hours", color: "#0f3460" },
      },
      x: { ticks: { color: "#0f3460" } },
    },
  };

  // ✅ Calendar Navigation
  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };
  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const monthDays = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(calendarYear, calendarMonth, i + 1)
  );
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const blankDays = Array(firstDayOfWeek).fill(null);
  const presentDays = new Set(Object.keys(dayHoursMap));

  // ✅ Render
  return (
    <>
      {/* 🌞 Floating Sun */}
      <div className="floating-sun"></div>
      {/* 🕊️ Flying Bird */}
      <div className="flying-bird"></div>

      <div className="container my-5">
        {/* ✅ Header Section */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold" style={{ color: "#0f3460" }}>
              Employee Attendance Dashboard
            </h2>

            {/* Filter Buttons - Left side */}
            <div className="mt-2 d-flex flex-wrap gap-2">
              {[
                { label: "Today", value: "today" },
                { label: "Last 7 Days", value: "7days" },
                { label: "Last 1 Month", value: "month" },
              ].map((btn) => (
                <button
                  key={btn.value}
                  className={`btn btn-sm px-3 fw-semibold ${
                    filterRange === btn.value ? "active-btn" : "inactive-btn"
                  }`}
                  onClick={() => setFilterRange(btn.value)}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time - Right side */}
          <div className="text-end">
            <h5 className="fw-semibold" style={{ color: "#0f3460" }}>
              Current Time: {currentTime.toLocaleTimeString()}
            </h5>
            <h6 className="fw-bold mt-1" style={{ color: "#0f3460" }}>
              Today's Working Hours: {todayHours} hrs
            </h6>
          </div>
        </div>

        {/* ✅ Main Content */}
        <div className="row">
          {/* Graph */}
          <div className="col-md-8 mb-4">
            <div className="card shadow border-0">
              <div className="card-body" style={{ height: "450px" }}>
                <Bar data={attendanceChartData} options={attendanceOptions} />
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="col-md-4">
            <div className="card shadow border-0">
              <div className="card-body small-calendar">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <button className="btn btn-sm nav-btn" onClick={handlePrevMonth}>
                    ⬅️
                  </button>
                  <h5 className="fw-semibold m-0" style={{ color: "#0f3460" }}>
                    {new Date(calendarYear, calendarMonth).toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h5>
                  <button className="btn btn-sm nav-btn" onClick={handleNextMonth}>
                    ➡️
                  </button>
                </div>

                <div className="calendar-grid compact">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="calendar-header">
                      {day}
                    </div>
                  ))}
                  {blankDays.map((_, i) => (
                    <div key={`blank-${i}`} className="calendar-day empty"></div>
                  ))}
                  {monthDays.map((date, idx) => {
                    const dateStr = date.toDateString();
                    const isPresent = presentDays.has(dateStr);
                    return (
                      <div
                        key={idx}
                        className={`calendar-day ${
                          isPresent ? "present-day" : "absent-day"
                        }`}
                      >
                        <span className="date-number">{date.getDate()}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 text-center">
                  
                  <span className="legend absent"></span> Absent
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeAttendanceDashboard;
