import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminTaskPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function AdminTaskPage() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ✅ Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tasks/admin-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) setTasks(res.data.tasks);
    } catch (err) {
      console.error("❌ Fetch Admin Tasks Error:", err.response?.data || err.message);
    }
  };

  // ✅ Create Task
  const createTask = async (e) => {
    e.preventDefault();
    if (!form.title) return alert("⚠️ Title is required");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/tasks/create`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        alert("✅ Task Created & Assigned");
        setForm({ title: "", description: "", priority: "Medium", dueDate: "" });
        fetchTasks();
      }
    } catch (err) {
      console.error("❌ Create Task Error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-4"> Admin Task Management</h2>

      {/* ✅ Create Task Form */}
      <div className="card p-3 mb-4 shadow-sm">
        <h5 className="mb-3">➕ Assign New Task</h5>
        <form onSubmit={createTask}>
          <div className="mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Task Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="mb-2">
            <textarea
              className="form-control"
              placeholder="Task Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="row">
            <div className="col-md-4 mb-2">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="col-md-4 mb-2">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-control"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <div className="col-md-4 mb-2 d-grid">
              <label className="form-label">&nbsp;</label>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Saving..." : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ✅ Task List */}
      <div className="card p-3 shadow-sm">
        <h5 className="mb-3">Tasks Assigned</h5>
        {tasks.length > 0 ? (
          <table className="table table-bordered table-striped">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Assigned Employees</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id}>
                  <td>{t.title}</td>
                  <td>{t.description || "—"}</td>
                  <td>
                    <span
                      className={
                        t.priority === "Low"
                          ? "priority-low"
                          : t.priority === "High"
                            ? "priority-high"
                            : "priority-medium"
                      }
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    {t.dueDate
                      ? new Date(t.dueDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${(t.status || "Pending").toLowerCase().replace(/\s+/g, "-")
                        }`}
                    >
                      {t.status || "Pending"}
                    </span>
                  </td>
                  <td>
                    {(t.assignedTo || []).map((emp) => (
                      <div key={emp._id}>
                        {emp.name} ({emp.email})
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-muted">No tasks assigned yet</p>
        )}
      </div>
    </div>
  );
}
