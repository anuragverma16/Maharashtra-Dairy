import { useState } from "react";
import PageHero from "../components/PageHero.jsx";
import { COMPANY } from "../data/company.js";
import { apiRequest } from "../lib/api.js";

const EMPTY_FORM = { name: "", email: "", phone: "", subject: "", message: "", website: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s-]{7,20}$/;

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(form.email.trim())) errors.email = "Please enter a valid email address.";
  if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) {
    errors.phone = "Please enter a valid mobile number.";
  }
  if (form.message.trim().length < 5) errors.message = "Please write a message (at least 5 characters).";
  return errors;
}

export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // { type: "success" | "error", msg }
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      const data = await apiRequest("/api/contact", {
        method: "POST",
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject,
          message: form.message.trim(),
          website: form.website, // honeypot, always empty for people
        },
      });
      setStatus({
        type: "success",
        msg: data.message || "Thank you! We have received your message.",
      });
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus({
        type: "error",
        msg: `${err.message} You can also call us on ${COMPANY.phone}.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="We'd Love to Hear From You"
        subtitle="Daily milk subscriptions, bulk orders, dealership enquiries or feedback — get in touch."
      />

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon" aria-hidden="true">📍</div>
              <div>
                <h3>Our Location</h3>
                <p><strong>{COMPANY.name}</strong></p>
                {COMPANY.address.map((line) => <p key={line}>{line}</p>)}
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon" aria-hidden="true">📞</div>
              <div>
                <h3>Call Us</h3>
                <p><a href={`tel:${COMPANY.phoneLink}`}>{COMPANY.phone}</a></p>
                <p className="muted">Mon – Sun, 6:00 AM – 9:00 PM</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon" aria-hidden="true">✉️</div>
              <div>
                <h3>Email Us</h3>
                <p><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></p>
                <p className="muted">We reply within 24 hours</p>
              </div>
            </div>
            <a
              className="btn btn-whatsapp"
              href={`https://wa.me/${COMPANY.phoneLink.replace("+", "")}`}
              target="_blank"
              rel="noreferrer"
            >
              💬 Chat on WhatsApp
            </a>
          </div>

          <form className="contact-form" onSubmit={onSubmit} noValidate>
            <h2>Send us a Message</h2>
            <p className="form-intro">Fields marked * are required.</p>

            <div className="form-row">
              <div className={`field ${errors.name ? "invalid" : ""}`}>
                <label htmlFor="contact-name">Full Name *</label>
                <input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={onChange}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                />
                {errors.name && <span className="field-error" id="contact-name-error">{errors.name}</span>}
              </div>

              <div className={`field ${errors.phone ? "invalid" : ""}`}>
                <label htmlFor="contact-phone">Mobile Number</label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98xxx xxxxx"
                  value={form.phone}
                  onChange={onChange}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                />
                {errors.phone && <span className="field-error" id="contact-phone-error">{errors.phone}</span>}
              </div>
            </div>

            <div className={`field ${errors.email ? "invalid" : ""}`}>
              <label htmlFor="contact-email">Email *</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={onChange}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
              />
              {errors.email && <span className="field-error" id="contact-email-error">{errors.email}</span>}
            </div>

            <div className="field">
              <label htmlFor="contact-subject">Subject</label>
              <select id="contact-subject" name="subject" value={form.subject} onChange={onChange}>
                <option value="">Select a topic</option>
                <option>Daily Milk Subscription</option>
                <option>Bulk / Event Order</option>
                <option>Dealership / Distribution</option>
                <option>Feedback</option>
                <option>Other</option>
              </select>
            </div>

            <div className={`field ${errors.message ? "invalid" : ""}`}>
              <label htmlFor="contact-message">Message *</label>
              <textarea
                id="contact-message"
                name="message"
                rows="5"
                value={form.message}
                onChange={onChange}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
              />
              {errors.message && <span className="field-error" id="contact-message-error">{errors.message}</span>}
            </div>

            {/* Hidden from people; bots that fill every input will fill this too */}
            <div className="hp-field" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={onChange}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>

            {status && (
              <div
                className={`alert ${status.type}`}
                role={status.type === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {status.msg}
              </div>
            )}
          </form>
        </div>
      </section>

      <section className="map-wrap">
        <iframe
          title="Maharashtra Dairy location on Google Maps"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(COMPANY.mapQuery)}&z=12&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </>
  );
}
