import React, { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function SalarySlipPage() {
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const API_URL =
    process.env.REACT_APP_API_URL?.trim() || "http://localhost:5000";

  // 🔍 Search employees
  const handleSearch = async () => {
    if (!search.trim()) return alert("⚠️ Enter name or email to search");
    try {
      const res = await axios.get(`${API_URL}/api/admin/employees/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: search },
      });
      if (res.data?.success) {
        setEmployees(res.data.employees);
        setSelectedEmployee(null);
      } else {
        alert(res.data?.msg || "No employees found");
      }
    } catch (err) {
      console.error("❌ Search Error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Failed to search employees");
    }
  };

  // 🧾 Fetch Salary Slip
  const fetchSalarySlip = async () => {
    if (!fromDate || !toDate || !selectedEmployee)
      return alert("⚠️ Please select employee and date range");

    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/admin/employee/salary-slip`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            from: fromDate,
            to: toDate,
            employeeId: selectedEmployee._id,
          },
        }
      );

      if (res.data?.success) {
        setData(res.data);
      } else {
        alert(res.data?.msg || "No salary slip data found");
        setData(null);
      }
    } catch (err) {
      console.error("❌ Salary Slip Error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Failed to fetch salary slip");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // 📅 Date formatter
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ⬇️ CSV Download (Simple)
  const downloadCSV = () => {
    if (!data) return;
    const { employee, summary, period } = data;

    const rows = [
      ["SALARY SLIP"],
      ["Company", employee?.companyName || "COMPANY NAME"],
      ["Period", `${period.from} - ${period.to}`],
      [],
      ["Employee Name", employee?.name || "—"],
      ["Employee ID", employee?.employeeId || "—"],
      ["Department", employee?.department || "—"],
      ["Position", employee?.position || "—"],
      ["Salary Per Day", `₹${employee?.salary || 0}`],
      [],
      ["Full Days", summary?.full || 0],
      ["Half Days", summary?.half || 0],
      ["Absent", summary?.absent || 0],
      ["Payable Days", summary?.payableDays || 0],
      ["Net Salary", `₹${summary?.payableAmount || 0}`],
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salary-slip_${period.from}_${period.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ⬇️ PDF Download (Simple)
  const downloadPDF = () => {
    if (!data) return;
    const { employee, summary, period } = data;

    const doc = new jsPDF();

    // Header
    doc.setFillColor(0, 51, 102);
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("SALARY SLIP", 15, 13);
    doc.setFontSize(12);
    doc.text(employee?.companyName || "COMPANY NAME", 120, 10);
    doc.setFontSize(9);
    doc.text(`Period: ${period.from} - ${period.to}`, 120, 18);

    doc.setTextColor(0, 0, 0);

    // Employee Info
    autoTable(doc, {
      startY: 28,
      theme: "plain",
      styles: { fontSize: 10 },
      body: [
        ["Employee Name", employee?.name || "—"],
        ["Employee ID", employee?.employeeId || "—"],
        ["Department", employee?.department || "—"],
        ["Position", employee?.position || "—"],
        ["Salary Per Day", `₹${employee?.salary || 0}`],
      ],
    });

    // Salary Summary
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Detail", "Value"]],
      body: [
        ["Full Days", summary?.full || 0],
        ["Half Days", summary?.half || 0],
        ["Absent", summary?.absent || 0],
        ["Payable Days", summary?.payableDays || 0],
        ["Net Salary", `₹${summary?.payableAmount || 0}`],
      ],
    });

    // Footer
    doc.setFontSize(10);
    doc.text("Pay Date: ____________________", 20, 280);
    doc.text("Signature: ____________________", 140, 280);

    doc.save(`salary-slip_${period.from}_${period.to}.pdf`);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-primary">🧾 Admin Salary Slip Generator</h2>

      {/* 🔍 Search Section */}
      <div className="card p-3 shadow-sm mb-4">
        <div className="row g-2">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-4 d-grid">
            <button className="btn btn-outline-primary" onClick={handleSearch}>
              🔍 Search Employee
            </button>
          </div>
        </div>
      </div>

      {/* Employee Results */}
      {employees.length > 0 && (
        <div className="card p-3 shadow-sm mb-4">
          <label className="mb-2 fw-bold">Select Employee:</label>
          <select
            className="form-select"
            value={selectedEmployee?._id || ""}
            onChange={(e) =>
              setSelectedEmployee(
                employees.find((emp) => emp._id === e.target.value) || null
              )
            }
          >
            <option value="">-- Select --</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name} ({emp.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Date Range */}
      <div className="card p-3 shadow-sm mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 d-grid">
          <button
            className="btn btn-primary"
            onClick={fetchSalarySlip}
            disabled={loading}
          >
            {loading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Loading...
              </span>
            ) : (
              "Fetch Salary Slip"
            )}
          </button>
        </div>
      </div>

      {/* Salary Slip Data */}
      {data && (
        <div className="card p-4 shadow-sm">
          <h5 className="mb-3 text-secondary">👤 Employee Details</h5>
          <table className="table table-sm">
            <tbody>
              <tr>
                <th>Name</th>
                <td>{data.employee?.name || "—"}</td>
                <th>Company</th>
                <td>{data.employee?.companyName || "—"}</td>
              </tr>
              <tr>
                <th>Employee ID</th>
                <td>{data.employee?.employeeId || "—"}</td>
                <th>Department</th>
                <td>{data.employee?.department || "—"}</td>
              </tr>
              <tr>
                <th>Position</th>
                <td>{data.employee?.position || "—"}</td>
                <th>Salary Per Day</th>
                <td>₹{data.employee?.salary || 0}</td>
              </tr>
            </tbody>
          </table>

          {/* Summary */}
          <div className="alert alert-info mt-4">
            <p>
              <b>Full Days:</b> {data.summary?.full || 0} |{" "}
              <b>Half Days:</b> {data.summary?.half || 0} |{" "}
              <b>Absent:</b> {data.summary?.absent || 0}
            </p>
            <p>
              <b>Payable Days:</b> {data.summary?.payableDays || 0}
            </p>
            <p className="fs-5 fw-bold">
              Net Salary: ₹{data.summary?.payableAmount || 0}
            </p>
          </div>

          {/* Download Buttons */}
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-success" onClick={downloadCSV}>
              ⬇️ Download CSV
            </button>
            <button className="btn btn-danger" onClick={downloadPDF}>
              ⬇️ Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
