import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Form, Button, Alert, Table } from "react-bootstrap";

const EmployeeForm = () => {
  const [employeeName, setEmployeeName] = useState("");
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState(""); 
  const [myMessages, setMyMessages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/messages", {
        employeeName,
        message,
        // ❌ adminId हटा दिया
      });
      setInfo("✅ Message sent successfully!");
      setMessage("");
      fetchMyMessages();
    } catch (err) {
      console.error("❌ Error sending message:", err);
      setInfo("❌ Error sending message");
    }
  };

  const fetchMyMessages = async () => {
    try {
      if (employeeName) {
        const res = await axios.get("http://localhost:5000/api/messages/all"); 
        console.log("📩 Employee fetched messages:", res.data);

        const allMsgs = res.data.data || [];

        // ✅ सिर्फ अपने नाम से filter करो (case-insensitive)
        const myMsgs = allMsgs.filter(
          (m) => m.employeeName.toLowerCase() === employeeName.toLowerCase()
        );

        setMyMessages(myMsgs);
      }
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
      setInfo("❌ Failed to fetch messages");
    }
  };

  useEffect(() => {
    if (employeeName) fetchMyMessages();
  }, [employeeName]);

  return (
    <Container className="mt-5">
      <h2>Employee Issue Report</h2>
      {info && <Alert variant={info.includes("Error") ? "danger" : "info"}>{info}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Your Name</Form.Label>
          <Form.Control
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Message</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Send Message
        </Button>
      </Form>

      {employeeName && (
        <>
          <h3 className="mt-5">My Issues</h3>
          {myMessages.length === 0 ? (
            <Alert variant="secondary">No issues submitted yet.</Alert>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {myMessages.map((msg) => (
                  <tr key={msg._id}>
                    <td>{msg.message}</td>
                    <td>{msg.status}</td>
                    <td>{new Date(msg.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </Container>
  );
};

export default EmployeeForm;
