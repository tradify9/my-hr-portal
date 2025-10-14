import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function PrivacyPolicy() {
  const company = {
    name: "Tradify Technologies Pvt. Ltd.",
    url: "https://myhr.tradify.in",
    effectiveDate: "01 October 2025",
    contactEmail: "privacy@tradify.in",
    address: "C-101, Sector 12, Noida, Uttar Pradesh, India",
    jurisdiction:
      "India (governed by the IT Act & the Digital Personal Data Protection Act, 2023)",
  };

  return (
    <div className="privacy-policy-page bg-light min-vh-100">
      {/* ==== HEADER SECTION ==== */}
      <section className="bg-primary text-white py-5 text-center shadow-sm">
        <div className="container">
          <h1 className="display-6 fw-bold mb-2">Privacy Policy</h1>
          <p className="mb-0">
            <small>Effective Date: {company.effectiveDate}</small>
          </p>
        </div>
      </section>

      {/* ==== MAIN CONTENT ==== */}
      <div className="container my-5">
        <div className="card border-0 shadow-lg rounded-4">
          <div className="card-body p-4 p-md-5">
            <p className="text-secondary mb-4">
              This Privacy Policy explains how{" "}
              <strong className="text-dark">{company.name}</strong> (“we”, “us”,
              “our”) collects, uses, and safeguards personal information
              provided by users on our HR Portal{" "}
              <a href={company.url} className="text-decoration-none">
                {company.url}
              </a>
              .
            </p>

            <div className="policy-section">
              <h5 className="fw-bold text-primary border-start border-3 ps-3">
                1. Information We Collect
              </h5>
              <ul className="mt-2">
                <li>Personal details (name, email, phone, employee ID)</li>
                <li>Employment data (department, attendance, payroll, leave)</li>
                <li>Login and usage details (IP, device, activity logs)</li>
              </ul>
            </div>

            <div className="policy-section mt-4">
              <h5 className="fw-bold text-primary border-start border-3 ps-3">
                2. How We Use Information
              </h5>
              <ul className="mt-2">
                <li>To provide and manage HR services</li>
                <li>To process payroll, leave, and attendance</li>
                <li>To maintain security and legal compliance</li>
              </ul>
            </div>

            <div className="policy-section mt-4">
              <h5 className="fw-bold text-primary border-start border-3 ps-3">
                3. Data Sharing
              </h5>
              <p>
                Data may be shared only with trusted service providers
                (e.g. payroll, hosting, compliance) and government authorities
                when required by law. We do not sell personal data under any
                circumstances.
              </p>
            </div>

            <div className="policy-section mt-4">
              <h5 className="fw-bold text-primary border-start border-3 ps-3">
                4. Data Security
              </h5>
              <p>
                We implement encryption, secure servers, and strict access
                controls to protect your information from unauthorized access or
                disclosure.
              </p>
            </div>

            <div className="policy-section mt-4">
              <h5 className="fw-bold text-primary border-start border-3 ps-3">
                5. Your Rights
              </h5>
              <p>
                You may request access, correction, or deletion of your data by
                contacting us at{" "}
                <a
                  href={`mailto:${company.contactEmail}`}
                  className="text-decoration-none fw-semibold"
                >
                  {company.contactEmail}
                </a>
                .
              </p>
            </div>

            <div className="policy-section mt-4">
              <h5 className="fw-bold text-primary border-start border-3 ps-3">
                6. Updates
              </h5>
              <p>
                We may update this Privacy Policy periodically. The most current
                version will always be available at{" "}
                <a href={company.url} className="text-decoration-none">
                  {company.url}
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* ==== FOOTER ==== */}
        <footer className="text-center mt-5 pt-4 border-top text-muted small">
          <p className="mb-1 fw-semibold">{company.name}</p>
          <p className="mb-1">{company.address}</p>
          <p className="mb-0">
            Contact:{" "}
            <a
              href={`mailto:${company.contactEmail}`}
              className="text-decoration-none"
            >
              {company.contactEmail}
            </a>{" "}
            • {company.jurisdiction}
          </p>
        </footer>
      </div>

      {/* ==== STYLING ==== */}
      <style>{`
        .privacy-policy-page {
          font-family: 'Inter', 'Segoe UI', sans-serif;
          color: #333;
        }

        .card {
          background: #fff;
          border-radius: 1rem;
        }

        .policy-section h5 {
          font-size: 1.1rem;
        }

        ul li {
          margin-bottom: 6px;
        }

        footer {
          font-size: 0.9rem;
        }

        @media print {
          body {
            background: white !important;
          }
          .card {
            box-shadow: none !important;
          }
          footer {
            margin-top: 30px;
          }
        }
      `}</style>
    </div>
  );
}
