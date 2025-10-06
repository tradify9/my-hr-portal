import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Form, Button, Alert, Table, Card } from "react-bootstrap";
import "./EmployeeForm.css"; // ✅ custom css

const EmployeeForm = () => {
  const [employeeName, setEmployeeName] = useState("");
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState("");
  const [myMessages, setMyMessages] = useState([]);

  // ✅ Send Message
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/messages", {
        employeeName,
        message,
      });
      setInfo("✅ Message sent successfully!");
      setMessage("");
      fetchMyMessages();
    } catch (err) {
      console.error("❌ Error sending message:", err);
      setInfo("❌ Error sending message");
    }
  };

  // ✅ Fetch Employee Messages
  const fetchMyMessages = async () => {
    try {
      if (employeeName) {
        const res = await axios.get("http://localhost:5000/api/messages/all");
        const allMsgs = res.data.data || [];

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
    <Container className="mt-5 employee-form">
      <h2 className="text-center mb-4">Employee Issue Report</h2>

      {info && (
        <Alert variant={info.includes("Error") ? "danger" : "success"}>
          {info}
        </Alert>
      )}

      {/* Form */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                required
                placeholder="Enter your full name"
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
                placeholder="Describe your issue here..."
              />
            </Form.Group>

            <div className="text-end">
              <Button variant="primary" type="submit">
                Send Message
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* My Issues List */}
      {employeeName && (
        <Card className="shadow-sm">
          <Card.Body>
            <h4 className="mb-3"> My Issues</h4>
            {myMessages.length === 0 ? (
              <Alert variant="secondary">No issues submitted yet.</Alert>
            ) : (
              <Table striped bordered hover responsive>
                <thead className="table-dark">
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
                      <td>
                        <span
                          className={`status-badge ${msg.status
                            .replace(" ", "-")
                            .toLowerCase()}`}
                        >
                          {msg.status}
                        </span>
                      </td>
                      <td>{new Date(msg.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default EmployeeForm;
