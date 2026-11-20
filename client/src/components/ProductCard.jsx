import { Link } from "react-router-dom";
import Icon, { productIcon } from "./Icon.jsx";
import "./product-card.css";

const CATEGORY_LABEL = { milk: "Fresh Milk", byproduct: "Milk By-Product" };

// Shared by the public catalogue and the admin "live preview"
export default function ProductCard({ p }) {
  const available = p.available !== false;
  const specs = [
    p.fatContent && { label: "Fat", value: p.fatContent },
    p.shelfLife && { label: "Shelf life", value: p.shelfLife },
    p.storage && { label: "Storage", value: p.storage },
    p.packaging && { label: "Pack", value: p.packaging },
  ].filter(Boolean);

  return (
    <article className={`pcard ${available ? "" : "pcard-unavailable"}`}>
      {p.image?.url && (
        <div className="pcard-photo">
          <img src={p.image.url} alt={p.name || "Product photo"} loading="lazy" />
        </div>
      )}
      <header className="pcard-top">
        {!p.image?.url && <span className="pcard-icon"><Icon name={productIcon(p.name)} size={26} /></span>}
        <div className="pcard-tags">
          {p.category && <span className="pcard-tag">{CATEGORY_LABEL[p.category] || p.category}</span>}
          {p.featured && <span className="pcard-tag pcard-tag-featured">Featured</span>}
        </div>
      </header>

      <h3 className="pcard-title">{p.name || "Product name"}</h3>
      {p.marathiName && <div className="pcard-marathi">{p.marathiName}</div>}
      {p.tagline && <p className="pcard-tagline">{p.tagline}</p>}

      {(p.price || p.sizes?.length > 0) && (
        <div className="pcard-buy">
          {p.price && <span className="pcard-price">{p.price}</span>}
          {p.sizes?.length > 0 && (
            <ul className="pcard-sizes" aria-label="Available pack sizes">
              {p.sizes.map((s) => <li key={s}>{s}</li>)}
            </ul>
          )}
        </div>
      )}

      {p.description && <p className="pcard-desc">{p.description}</p>}

      {p.benefits?.length > 0 && (
        <ul className="pcard-benefits">
          {p.benefits.slice(0, 2).map((b) => <li key={b}>{b}</li>)}
        </ul>
      )}

      {specs.length > 0 && (
        <dl className="pcard-specs">
          {specs.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {p.badges?.length > 0 && (
        <div className="pcard-badges">
          {p.badges.slice(0, 2).map((b) => <span key={b}>{b}</span>)}
        </div>
      )}

      <footer className="pcard-footer">
        {available ? (
          <Link to="/contact" className="pcard-cta">Enquire / Order</Link>
        ) : (
          <span className="pcard-status">Currently unavailable</span>
        )}
      </footer>
    </article>
  );
}
