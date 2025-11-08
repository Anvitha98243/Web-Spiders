// pages/Contact.jsx
import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import "./Contact.css";

function Contact({ user }) {
  const formRef = useRef();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    emailjs
      .sendForm(
        "service_rj2ec9i",   // 🔹 Replace with your EmailJS Service ID
        "template_rmg53f7",  // 🔹 Replace with your EmailJS Template ID
        formRef.current,
        "EsXnVnfs65pXBno7O"    // 🔹 Replace with your EmailJS Public Key
      )
      .then(
        () => {
          setSuccess(true);
          setFormData({
            name: user?.name || "",
            email: user?.email || "",
            subject: "",
            message: "",
          });
        },
        (error) => {
          console.error("FAILED...", error.text);
          setError("Failed to send message. Please try again.");
        }
      )
      .finally(() => setLoading(false));
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Send us a message!</p>
        </div>
      </div>

      <div className="contact-content container">
        <div className="contact-grid">
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <p>
              Have questions about our platform? Need help with your property
              listing? Or just want to share feedback? We're here to help!
            </p>

            <div className="info-cards">
              <div className="info-card">
                <div className="info-icon">📧</div>
                <h3>Email</h3>
                <p>vasanta2609@gmail.com</p>
              </div>

              <div className="info-card">
                <div className="info-icon">📞</div>
                <h3>Phone</h3>
                <p>9949528256</p>
              </div>

              <div className="info-card">
                <div className="info-icon">📍</div>
                <h3>Address</h3>
                <p>
                  123 Real Estate Avenue
                  <br />
                  Hyderabad, Telangana
                  <br />
                  India
                </p>
              </div>

              <div className="info-card">
                <div className="info-icon">🕒</div>
                <h3>Business Hours</h3>
                <p>
                  Monday - Friday: 9:00 AM - 6:00 PM
                  <br />
                  Saturday: 10:00 AM - 4:00 PM
                  <br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <h2>Send Us a Message</h2>

            {success && (
              <div className="success-message">
                ✅ Thank you for your message! We'll get back to you soon.
              </div>
            )}

            {error && <div className="error-message">❌ {error}</div>}

            <form ref={formRef} onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject" className="form-label">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="What is this regarding?"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Type your message here..."
                  rows="6"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;