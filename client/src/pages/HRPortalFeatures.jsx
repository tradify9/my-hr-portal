import React from "react";
import {
  FaCalendarCheck,
  FaUserCheck,
  FaChartBar,
  FaLock,
  FaUsers,
  FaLaptopHouse,
  FaBell,
  FaCogs,
  FaCheckCircle,
} from "react-icons/fa";

const HRPortalFeatures = () => {
  const themeColor = "#0f3460";

  return (
    <div>
      {/* ===== Hero Section ===== */}
      <section
        className="py-5 text-white text-center"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/free-photo/modern-office-interior-design_158595-6466.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div
          style={{
           
            padding: "70px 20px",
          }}
        >
          <h1 className="fw-bold">HR Portal Features</h1>
          <p className="lead">
            Smart, Secure & Seamless HR Management for Modern Workplaces
          </p>
        </div>
      </section>

      {/* ===== Features Grid ===== */}
      <section className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-4" style={{ color: themeColor }}>
            Our Key Features
          </h2>
          <p className="text-muted mb-5">
            Explore the powerful features of our HR Portal designed to make your
            workplace efficient, transparent, and productive.
          </p>
          <div className="row g-4">
            {[
              { icon: <FaCalendarCheck size={40} />, title: "Attendance Tracking", desc: "Monitor and track employee attendance with ease." },
              { icon: <FaUserCheck size={40} />, title: "Leave Management", desc: "Apply, approve, and manage leaves seamlessly." },
              { icon: <FaChartBar size={40} />, title: "Analytics Dashboard", desc: "Make smarter decisions with data-driven insights." },
              { icon: <FaLock size={40} />, title: "Secure Data", desc: "Ensure employee data safety with encryption." },
              { icon: <FaUsers size={40} />, title: "Employee Directory", desc: "Store and access employee records in one place." },
              { icon: <FaLaptopHouse size={40} />, title: "Remote Ready", desc: "Access HR Portal anytime, anywhere on any device." },
              { icon: <FaBell size={40} />, title: "Notifications", desc: "Get instant updates for leaves, approvals & events." },
              { icon: <FaCogs size={40} />, title: "Customizable", desc: "Configure portal as per your organization’s needs." },
            ].map((feature, index) => (
              <div className="col-md-3 col-6" key={index}>
                <div
                  className="card shadow-sm h-100 border-0 p-3"
                  style={{ transition: "0.3s", borderRadius: "12px" }}
                >
                  <div
                    className="mb-3"
                    style={{ color: themeColor }}
                  >
                    {feature.icon}
                  </div>
                  <h6 className="fw-semibold" style={{ color: themeColor }}>
                    {feature.title}
                  </h6>
                  <p className="small text-muted">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Highlight Section ===== */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-md-6">
              <img
                src="https://img.freepik.com/free-vector/office-workers-analyzing-graphs_74855-4561.jpg"
                alt="HR Management"
                className="img-fluid rounded shadow"
              />
            </div>
            <div className="col-md-6">
              <h3 className="fw-bold mb-3" style={{ color: themeColor }}>
                Why Choose Our HR Portal?
              </h3>
              <p className="text-muted">
                Our HR Portal provides everything your HR team needs in one
                place. From real-time tracking to secure storage and advanced
                analytics, we help organizations save time and focus on growth.
              </p>
              <ul className="list-unstyled mt-3">
                <li className="mb-2">
                  <FaCheckCircle style={{ color: themeColor }} className="me-2" />
                  Easy to Use
                </li>
                <li className="mb-2">
                  <FaCheckCircle style={{ color: themeColor }} className="me-2" />
                  24/7 Cloud Access
                </li>
                <li className="mb-2">
                  <FaCheckCircle style={{ color: themeColor }} className="me-2" />
                  Scalable for any team size
                </li>
                <li className="mb-2">
                  <FaCheckCircle style={{ color: themeColor }} className="me-2" />
                  Saves Time & Improves Productivity
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Call to Action ===== */}
      <section className="py-5 text-center text-white" style={{ background: themeColor }}>
        <div className="container">
          <h2 className="fw-bold mb-3">Ready to Transform Your HR?</h2>
          <p className="mb-4">
            Experience seamless HR operations with our powerful HR Portal.
          </p>
          <button
            className="btn fw-semibold px-4 py-2 rounded-pill"
            style={{ background: "#fff", color: themeColor }}
          >
            Get Started 🚀
          </button>
        </div>
      </section>
    </div>
  );
};

export default HRPortalFeatures;
