import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { COMPANY } from "../data/company.js";
import { apiRequest } from "../lib/api.js";
import "./site-chrome.css";

const whatsappLink = `https://wa.me/${COMPANY.phoneLink.replace(/\D/g, "")}`;

export default function Footer() {
  // null until the live counts load; stays null if the server is unreachable
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/products")
      .then((res) => {
        if (cancelled || !Array.isArray(res.data)) return;
        setCounts({
          total: res.data.length,
          milk: res.data.filter((p) => p.category === "milk").length,
          byproduct: res.data.filter((p) => p.category === "byproduct").length,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    { value: COMPANY.since, label: "Established" },
    { value: counts?.milk, label: "Fresh milk products" },
    { value: counts?.byproduct, label: "Milk by-products" },
    { value: counts?.total, label: "Products listed" },
  ];

  return (
    <footer className="footer">
      <div className="rope" />

      <div className="container">
        <div className="footer-stats" role="list">
          {stats.map((s) => (
            <div className="footer-stat" role="listitem" key={s.label}>
              <span className="footer-stat-value">{s.value ?? "—"}</span>
              <span className="footer-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <img src="/logo.png" alt="" />
            <div>
              <strong>MAHARASHTRA DAIRY</strong>
              <small>{COMPANY.marathi}</small>
            </div>
          </div>
          <p>Fresh from farm to table — pure milk and traditional dairy products from the villages of Solapur.</p>
          <p className="tagline">{COMPANY.tagline}</p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/quality">Quality & Hygiene</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4>Our Products</h4>
          <ul>
            <li>Cow & Buffalo Milk</li>
            <li>Dahi (Curd) & Shrikhand</li>
            <li>Chaas & Lassi</li>
            <li>Malai, Butter & Ghee</li>
            <li>Fresh Paneer</li>
          </ul>
        </div>

        <div>
          <h4>Reach Us</h4>
          <div className="footer-phone">
            <span className="footer-phone-label">Call us</span>
            <a className="footer-phone-number" href={`tel:${COMPANY.phoneLink}`}>
              <Phone size={18} aria-hidden="true" />{COMPANY.phone}
            </a>
            <a className="footer-whatsapp" href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} aria-hidden="true" />WhatsApp
            </a>
          </div>
          <ul className="contact-list">
            <li><MapPin size={15} aria-hidden="true" />{COMPANY.address.join(", ")}</li>
            <li><Mail size={15} aria-hidden="true" /><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Maharashtra Dairy, Solapur · Estd. {COMPANY.since}
      </div>
    </footer>
  );
}
