import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './components/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import CreateEmployee from './pages/CreateEmployee'; // ✅ Create & Edit दोनों के लिए
import EmployeeAttendance from "./pages/EmployeeAttendance";
import EmployeeProfile from './pages/EmployeeProfile';
import SalarySlipPage from './pages/SalarySlipPage';
import AdminTaskPage from './pages/AdminTaskPage';
import EmployeeTaskPage from './pages/EmployeeTaskPage';
import EmployeeForm from './pages/EmployeeForm';
import AdminMessages from './pages/AdminMessages';
import AttendanceLeaveDashboard from './pages/AttendanceLeaveDashboard';
import AboutPage from './pages/AboutPage';
import ContactUs from './pages/ContactUs';
import HRPortalFeatures from './pages/HRPortalFeatures';
import EmployeeAttendanceLeaveDashboard from './pages/EmployeeAttendanceLeaveDashboard';
import HRPortalPolicies from './pages/HrPortalPolicies';


function App() {
  const [role, setRole] = useState(null);

  // ✅ Restore role from localStorage on refresh
  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    if (savedRole) setRole(savedRole);
  }, []);

  // ✅ Save role when user logs in
  const handleSetRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem("role", newRole);
  };

  // ✅ Protected Route wrapper
  const ProtectedRoute = ({ allowedRole, children }) => {
    if (!role) {
      return <Navigate to="/" replace />; // not logged in → go to login
    }
    if (role !== allowedRole) {
      return <Navigate to="/" replace />; // wrong role → go to login
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* ✅ Login Route */}
        <Route path="/" element={<Login setRole={handleSetRole} />} />

        {/* ✅ Super Admin */}
        <Route
          path="/superadmin/*"
          element={
            <ProtectedRoute allowedRole="superadmin">
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ Admin Dashboard */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ Create Employee Page (Admin Only) */}
        <Route
          path="/admin/create-employee"
          element={
            <ProtectedRoute allowedRole="admin">
              <CreateEmployee />
            </ProtectedRoute>
          }
        />

        {/* ✅ Edit Employee Page (Admin Only) */}
        <Route
          path="/admin/edit-employee/:id"
          element={
            <ProtectedRoute allowedRole="admin">
              <CreateEmployee /> {/* same form will be used for edit */}
            </ProtectedRoute>
          }
        />

        {/* ✅ Employee Dashboard */}
        <Route
          path="/employee/*"
          element={
            <ProtectedRoute allowedRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/attendance" element={<EmployeeAttendance />} />
        <Route path="/employee/profile" element={<EmployeeProfile />} />
        <Route path="/salary/slipe" element={<SalarySlipPage />} />
        <Route path="/admin/task" element={<AdminTaskPage />} />
        <Route path="/employee/task" element={<EmployeeTaskPage />} />
        <Route path="/employee/form" element={<EmployeeForm />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route path="/attendance/leave" element={<AttendanceLeaveDashboard />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contect" element={<ContactUs />} />
        <Route path="/hr/fea" element={<HRPortalFeatures />} />
        <Route path="/employee/gui" element={<EmployeeAttendanceLeaveDashboard />} />
         <Route path="/HR/policies" element={<HRPortalPolicies />} />
        




      </Routes> 
    </Router>
  );
}

export default App;
