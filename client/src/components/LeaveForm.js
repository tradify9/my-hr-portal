import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaveForm = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState([]); // ✅ always array

  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // ✅ Fetch leaves (history)
  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/employee/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🔑 Ensure we always set an array
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.leaves || [];

      setLeaves(data);
    } catch (err) {
      console.error("Fetch leaves error:", err.response?.data || err.message);
      setLeaves([]); // fallback empty array
    }
  };

  useEffect(() => {
    fetchLeaves();

    // 🔄 Auto refresh leaves every 10s
    const interval = setInterval(fetchLeaves, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Submit leave request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/employee/leaves`,
        { startDate, endDate, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Leave requested successfully');

      // reset form
      setStartDate('');
      setEndDate('');
      setReason('');

      // reload leave history
      fetchLeaves();
    } catch (err) {
      console.error("Leave request error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "❌ Failed to request leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 border rounded">
      <h5 className="mb-3">Request Leave</h5>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Reason</label>
          <textarea
            className="form-control"
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Leave"}
        </button>
      </form>

      {/* ✅ Leave history */}
      <h5 className="mt-4">My Leave History</h5>
      {leaves.length === 0 ? (
        <p className="text-muted">No leave requests yet.</p>
      ) : (
        <table className="table table-bordered table-sm mt-2">
          <thead>
            <tr>
              <th>Start</th>
              <th>End</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave._id}>
                <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                <td>{leave.reason}</td>
                <td>
                  <span
                    className={`badge ${
                      leave.status === "approved"
                        ? "bg-success"
                        : leave.status === "rejected"
                        ? "bg-danger"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaveForm;
