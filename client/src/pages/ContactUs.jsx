import React, { useRef } from "react";
import emailjs from "emailjs-com";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const ContactUs = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "YOUR_SERVICE_ID", // replace with EmailJS service ID
        "YOUR_TEMPLATE_ID", // replace with EmailJS template ID
        form.current,
        "YOUR_USER_ID" // replace with EmailJS public key
      )
      .then(
        (result) => {
          alert("✅ Message Sent Successfully!");
          form.current.reset();
        },
        (error) => {
          alert("❌ Failed to send message. Please try again.");
          console.error(error.text);
        }
      );
  };

  return (
    <section className="py-5">
      <div className="container">
        <h2 className="text-center mb-4">Contact Us</h2>
        <p className="text-center mb-5 text-muted">
          Have questions about our HR Portal? We’d love to hear from you.
        </p>

        <div className="row">
          {/* ===== Left Side - Contact Info ===== */}
          <div className="col-md-5 mb-4">
            <div className="card shadow-sm p-4 h-100">
              <h4 className="mb-3">Get in Touch</h4>
              <p>
                <FaEnvelope className="me-2 text-primary" />
                support@hrportal.com
              </p>
              <p>
                <FaPhone className="me-2 text-success" /> +91 98765 43210
              </p>
              <p>
                <FaMapMarkerAlt className="me-2 text-danger" /> New Delhi, India
              </p>
              <hr />
              <p>
                We’re here to help you streamline your HR processes and provide
                complete support for your team.
              </p>
            </div>
          </div>

          {/* ===== Right Side - Contact Form ===== */}
          <div className="col-md-7">
            <div className="card shadow-sm p-4">
              <h4 className="mb-3">Send us a Message</h4>
              <form ref={form} onSubmit={sendEmail}>
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    name="user_name"
                    className="form-control"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label">Your Email</label>
                  <input
                    type="email"
                    name="user_email"
                    className="form-control"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {/* Dropdown for HR Portal Feature */}
                <div className="mb-3">
                  <label className="form-label">Select Topic</label>
                  <select
                    name="topic"
                    className="form-select"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Choose a topic
                    </option>
                    <option value="Attendance">Attendance</option>
                    <option value="Leave Management">Leave Management</option>
                    <option value="Employee Dashboard">Employee Dashboard</option>
                    <option value="Analytics & Reports">Analytics & Reports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div className="mb-3">
                  <label className="form-label">Your Message</label>
                  <textarea
                    name="message"
                    className="form-control"
                    rows="5"
                    placeholder="Write your message..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
