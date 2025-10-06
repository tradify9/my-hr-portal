import React from "react";
import {
    FaUsers,
    FaCalendarCheck,
    FaShieldAlt,
    FaChartBar,
    FaGlobe,
    FaSmileBeam,
    FaLaptopHouse,
    FaCogs,
} from "react-icons/fa";

const AboutPage = () => {
    const themeColor = "#0f3460";

    return (
        <div>
            {/* ===== Hero Section ===== */}
            <section
                className="py-5 text-white text-center"
                style={{
                    backgroundImage:
                        "url('https://www.orbacloudcfo.com/wp-content/uploads/2022/01/Employee-Retention-Strategy.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="container" style={{ padding: "20px",  }}>
                    <h1 className="mb-3 fw-bold">About Our HR Portal</h1>
                    <p className="lead">
                        Smart, Secure & Seamless HR Management for Modern Workplaces
                    </p>
                </div>
            </section>

            {/* ===== Intro Section ===== */}
            <section className="py-5">
                <div className="container">
                    <div className="row align-items-center">
                        {/* Left Content */}
                        <div className="col-md-6">
                            <h2 className="mb-4 fw-bold" style={{ color: themeColor }}>
                                Welcome to Our HR Portal
                            </h2>
                            <p>
                                Our HR Portal is a one-stop solution for simplifying human
                                resource management. From attendance tracking to leave
                                management and insightful analytics, we empower businesses to
                                focus on what truly matters – their people.
                            </p>
                            <p>
                                With user-friendly design and powerful features, our platform
                                ensures both employees and HR teams can collaborate efficiently
                                in real-time.
                            </p>
                        </div>
                        {/* Right Image */}
                        <div className="col-md-6 text-center">
                            <img
                                src="https://img.freepik.com/free-vector/business-team-analyzing-financial-graphs_1262-20660.jpg"
                                alt="HR Portal"
                                className="img-fluid rounded shadow"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== Features Section ===== */}
            <section className="py-5 bg-light">
                <div className="container text-center">
                    <h2 className="mb-5 fw-bold" style={{ color: themeColor }}>Key Features</h2>
                    <div className="row">
                        <div className="col-md-3 mb-4">
                            <FaCalendarCheck size={40} style={{ color: themeColor }} className="mb-3" />
                            <h5 style={{ color: themeColor }}>Attendance Tracking</h5>
                            <p>Monitor employee attendance in real time with accuracy.</p>
                        </div>
                        <div className="col-md-3 mb-4">
                            <FaUsers size={40} style={{ color: themeColor }} className="mb-3" />
                            <h5 style={{ color: themeColor }}>Leave Management</h5>
                            <p>Easy leave requests, approvals, and history management.</p>
                        </div>
                        <div className="col-md-3 mb-4">
                            <FaShieldAlt size={40} style={{ color: themeColor }} className="mb-3" />
                            <h5 style={{ color: themeColor }}>Secure Data</h5>
                            <p>Confidential employee data is stored with top security.</p>
                        </div>
                        <div className="col-md-3 mb-4">
                            <FaChartBar size={40} style={{ color: themeColor }} className="mb-3" />
                            <h5 style={{ color: themeColor }}>Analytics Dashboard</h5>
                            <p>Insightful reports and analytics for smarter decisions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== Why Choose Us Section ===== */}
            <section className="py-5">
                <div className="container text-center">
                    <h2 className="mb-5 fw-bold" style={{ color: themeColor }}>
                        Why Choose Our HR Portal?
                    </h2>
                    <div className="row">
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm h-100 border-0">
                                <div className="card-body">
                                    <FaSmileBeam size={40} style={{ color: themeColor }} className="mb-3" />
                                    <h5 style={{ color: themeColor }}>User Friendly</h5>
                                    <p>
                                        Simple design so employees and HR teams can use it without
                                        training.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm h-100 border-0">
                                <div className="card-body">
                                    <FaGlobe size={40} style={{ color: themeColor }} className="mb-3" />
                                    <h5 style={{ color: themeColor }}>Accessible Anywhere</h5>
                                    <p>
                                        Cloud-based system available 24/7 from any device and
                                        location.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm h-100 border-0">
                                <div className="card-body">
                                    <FaLaptopHouse size={40} style={{ color: themeColor }} className="mb-3" />
                                    <h5 style={{ color: themeColor }}>Remote Ready</h5>
                                    <p>
                                        Perfect for modern workplaces, hybrid offices, and remote
                                        teams.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== Vision & Mission ===== */}
            <section className="py-5 bg-light">
                <div className="container text-center">
                    <h2 className="mb-5 fw-bold" style={{ color: themeColor }}>Our Vision & Mission</h2>
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <div className="card shadow-sm h-100 border-0">
                                <div className="card-body">
                                    <FaCogs size={40} style={{ color: themeColor }} className="mb-3" />
                                    <h5 style={{ color: themeColor }}>Our Vision</h5>
                                    <p>
                                        To revolutionize HR management by creating a platform that
                                        saves time, boosts productivity, and builds a happy
                                        workplace.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="card shadow-sm h-100 border-0">
                                <div className="card-body">
                                    <FaUsers size={40} style={{ color: themeColor }} className="mb-3" />
                                    <h5 style={{ color: themeColor }}>Our Mission</h5>
                                    <p>
                                        To empower organizations with secure, smart, and scalable
                                        HR solutions that put people first and technology second.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
