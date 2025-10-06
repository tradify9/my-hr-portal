import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EmployeeTaskPage.css"; // ✅ custom css

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function EmployeeTaskPage() {
  const [tasks, setTasks] = useState([]);
  const token = localStorage.getItem("token");

  // ✅ Fetch my tasks (employee only)
  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tasks/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) setTasks(res.data.tasks);
    } catch (err) {
      console.error("❌ Fetch My Tasks Error:", err.response?.data || err.message);
    }
  };

  // ✅ Update Task Status
  const updateStatus = async (id, status) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/tasks/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) fetchTasks();
    } catch (err) {
      console.error("❌ Update Task Error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, []);

  // ✅ Badge helper
  const renderBadge = (text, type) => {
    let className = "badge ";
    if (type === "priority") {
      className +=
        text === "High"
          ? "bg-danger"
          : text === "Medium"
          ? "bg-warning text-dark"
          : "bg-secondary";
    } else if (type === "status") {
      className +=
        text === "Completed"
          ? "bg-success"
          : text === "In Progress"
          ? "bg-info text-dark"
          : "bg-secondary";
    }
    return <span className={className}>{text}</span>;
  };

  return (
    <div className="employee-task-page py-4 px-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">My Tasks</h2>
      </div>

      <div className="card shadow-sm border-0 w-100">
        <div className="card-body p-0">
          {tasks.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                {/* ✅ Light header instead of dark */}
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "15%" }}>Title</th>
                    <th style={{ width: "30%" }}>Description</th>
                    <th style={{ width: "10%" }}>Priority</th>
                    <th style={{ width: "15%" }}>Due Date</th>
                    <th style={{ width: "10%" }}>Status</th>
                    <th style={{ width: "20%" }}>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t._id}>
                      <td className="fw-semibold">{t.title}</td>
                      <td>{t.description || "—"}</td>
                      <td>{renderBadge(t.priority, "priority")}</td>
                      <td>
                        {t.dueDate
                          ? new Date(t.dueDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>{renderBadge(t.status, "status")}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={t.status}
                          onChange={(e) => updateStatus(t._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center py-5 mb-0">
               You don’t have any tasks yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
