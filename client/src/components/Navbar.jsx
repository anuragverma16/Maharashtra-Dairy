import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { COMPANY } from "../data/company.js";
import "./site-chrome.css";

const whatsappLink = `https://wa.me/${COMPANY.phoneLink.replace(/\D/g, "")}`;

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/products", label: "Products" },
  { to: "/quality", label: "Quality & Hygiene" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-left">
            <span className="topbar-item"><MapPin size={14} aria-hidden="true" />Valsang, Solapur, Maharashtra</span>
            <span className="topbar-item topbar-est">Est. {COMPANY.since}</span>
          </div>
          <div className="topbar-right">
            <a className="topbar-item" href={`tel:${COMPANY.phoneLink}`}>
              <Phone size={14} aria-hidden="true" />{COMPANY.phone}
            </a>
            <a className="topbar-item" href={`mailto:${COMPANY.email}`}>
              <Mail size={14} aria-hidden="true" />{COMPANY.email}
            </a>
            <a className="topbar-cta" href={whatsappLink} target="_blank" rel="noopener noreferrer">
              WhatsApp us
            </a>
          </div>
        </div>
      </div>
      <nav className="container nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt="Maharashtra Dairy logo" />
          <div>
            <strong>MAHARASHTRA DAIRY</strong>
            <small>{COMPANY.marathi}</small>
          </div>
        </Link>

        <button
          className={`burger ${open ? "is-open" : ""}`}
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          <span /><span /><span />
        </button>

        <ul className={`nav-links ${open ? "open" : ""}`}>
          {links.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
