import React, { useEffect, useState } from "react";
import axios from "axios";

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

  return (
    <div className="container mt-4">
      <h2 className="text-success mb-4">👨‍💻 My Tasks</h2>

      <div className="card p-3 shadow-sm">
        {tasks.length > 0 ? (
          <table className="table table-bordered table-striped">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id}>
                  <td>{t.title}</td>
                  <td>{t.description || "—"}</td>
                  <td>{t.priority}</td>
                  <td>
                    {t.dueDate
                      ? new Date(t.dueDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>{t.status}</td>
                  <td>
                    <select
                      className="form-select"
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
        ) : (
          <p className="text-muted">You don’t have any tasks yet.</p>
        )}
      </div>
    </div>
  );
}
