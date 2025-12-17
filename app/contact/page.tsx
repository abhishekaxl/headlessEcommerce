/**
 * Contact Page - Urban Jungle Co.
 */

'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    setSubmitted(true);
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We&apos;d love to hear from you</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p>Have a question about our plants? Want to know more about care tips? Drop us a line and we&apos;ll get back to you as soon as possible.</p>
              
              <div className="info-items">
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <div>
                    <h4>Visit Us</h4>
                    <p>123 Green Street<br />Plant City, PC 12345</p>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">📧</span>
                  <div>
                    <h4>Email Us</h4>
                    <p>hello@urbanjungle.co</p>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">📞</span>
                  <div>
                    <h4>Call Us</h4>
                    <p>(555) 123-4567</p>
                  </div>
                </div>
              </div>

              <div className="social-links">
                <a href="#" aria-label="Facebook">📘</a>
                <a href="#" aria-label="Instagram">📷</a>
                <a href="#" aria-label="Twitter">🐦</a>
                <a href="#" aria-label="Pinterest">📌</a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-wrapper">
              {submitted ? (
                <div className="success-message">
                  <span className="success-icon">✓</span>
                  <h3>Thank You!</h3>
                  <p>Your message has been sent successfully. We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .contact-page {
          min-height: 100vh;
        }

        .contact-hero {
          background: linear-gradient(135deg, rgba(74, 124, 89, 0.1) 0%, #f8f7f4 100%);
          padding: 80px 24px;
          text-align: center;
        }

        .contact-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .contact-hero p {
          font-size: 1.25rem;
          color: #666;
          margin: 0;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .contact-section {
          padding: 80px 24px;
          background: #fff;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 60px;
        }

        .contact-info h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 20px;
        }

        .contact-info > p {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #666;
          margin-bottom: 40px;
        }

        .info-items {
          margin-bottom: 40px;
        }

        .info-item {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .info-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .info-item h4 {
          font-family: 'Jost', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .info-item p {
          font-size: 15px;
          color: #666;
          margin: 0;
          line-height: 1.5;
        }

        .social-links {
          display: flex;
          gap: 16px;
        }

        .social-links a {
          font-size: 1.5rem;
          transition: transform 0.2s;
        }

        .social-links a:hover {
          transform: scale(1.2);
        }

        .contact-form-wrapper {
          background: #f8f7f4;
          padding: 40px;
          border-radius: 8px;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea {
          padding: 14px 16px;
          border: 1px solid #e8e6e1;
          background: #fff;
          font-size: 16px;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #4a7c59;
        }

        .success-message {
          text-align: center;
          padding: 60px 20px;
        }

        .success-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: #4a7c59;
          color: #fff;
          font-size: 2rem;
          border-radius: 50%;
          margin-bottom: 24px;
        }

        .success-message h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .success-message p {
          font-size: 1.1rem;
          color: #666;
          margin: 0;
        }

        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .contact-form-wrapper {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}


