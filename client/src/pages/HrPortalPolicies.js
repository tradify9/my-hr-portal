import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function PrivacyPolicy() {
  const handlePrint = () => {
    window.print();
  };

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
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Privacy Policy</h1>
          <small className="text-muted">
            Effective Date: {company.effectiveDate}
          </small>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={handlePrint}
          title="Print or Save as PDF"
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Policy Content */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <p className="text-muted">
            This Privacy Policy describes how <strong>{company.name}</strong>{" "}
            (“we”, “us”, “our”) collects, uses, and protects personal
            information through our HR Portal at <strong>{company.url}</strong>.
          </p>

          <h5 className="mt-4">1. Information We Collect</h5>
          <ul>
            <li>Personal details (name, email, phone, employee ID).</li>
            <li>Employment data (department, attendance, payroll, leave).</li>
            <li>Login and usage details (IP, device, activity logs).</li>
          </ul>

          <h5 className="mt-4">2. How We Use Information</h5>
          <ul>
            <li>To provide and manage HR services.</li>
            <li>To process payroll, leave, and attendance.</li>
            <li>To maintain security and legal compliance.</li>
          </ul>

          <h5 className="mt-4">3. Data Sharing</h5>
          <p>
            We may share data only with trusted service providers (payroll,
            hosting, compliance) and government authorities if required by law.
            We do not sell personal information.
          </p>

          <h5 className="mt-4">4. Data Security</h5>
          <p>
            We use encryption, secure servers, and limited access controls to
            protect your information.
          </p>

          <h5 className="mt-4">5. Your Rights</h5>
          <p>
            You can access, correct, or request deletion of your data by
            contacting{" "}
            <a href={`mailto:${company.contactEmail}`}>
              {company.contactEmail}
            </a>
            .
          </p>

          <h5 className="mt-4">6. Updates</h5>
          <p>
            We may update this policy periodically. The latest version will be
            available on <strong>{company.url}</strong>.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-4 text-muted small">
        {company.name} • {company.address} • Contact: {company.contactEmail} •{" "}
        {company.jurisdiction}
      </footer>

      {/* Print styles */}
      <style>{`
        @media print {
          .btn { display: none !important; }
          .container { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
