import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Form, Alert, Spinner, Button } from "react-bootstrap";
import "./AdminMessages.css";


const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const adminId = "admin123"; // ✅ lowercase to match backend

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/messages/admin/${adminId}`
      );
      console.log("✅ Messages fetched (raw):", res.data);

      const msgs = res.data.data || [];
      console.log("📩 Final messages for admin:", msgs);

      setMessages(msgs);
      setError("");
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (messageId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/messages/status/${messageId}`, {
        status: newStatus,
        adminId,
      });
      fetchMessages();
    } catch (err) {
      console.error("❌ Error updating status:", err);
      setError("Failed to update status");
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/messages/${messageId}`, {
        data: { adminId }, // ✅ ensure only correct admin can delete
      });
      fetchMessages();
    } catch (err) {
      console.error("❌ Error deleting message:", err);
      setError("Failed to delete message");
    }
  };

  return (
    <Container className="mt-5">
      <h2>Admin Panel - My Employees' Messages</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading && <Spinner animation="border" variant="primary" />}

      {!loading && messages.length === 0 ? (
        <Alert variant="info">No messages found for this admin.</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Message</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg._id}>
                <td>{msg.employeeName}</td>
                <td>{msg.message}</td>
                <td>{msg.status}</td>
                <td>{new Date(msg.createdAt).toLocaleString()}</td>
                <td>
                  <Form.Select
                    value={msg.status}
                    onChange={(e) => updateStatus(msg._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteMessage(msg._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default AdminMessages;
