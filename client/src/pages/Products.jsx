import { useEffect, useState } from "react";
import PageHero from "../components/PageHero.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { apiRequest } from "../lib/api.js";

const tabs = [
  { key: "all", label: "All Products" },
  { key: "milk", label: "Milk" },
  { key: "byproduct", label: "Milk By-Products" },
];

export default function Products() {
  // null = still loading; [] = the database has no products yet
  const [products, setProducts] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    let cancelled = false;
    // Products come only from the database (the ones added in the admin panel)
    apiRequest("/api/products")
      .then((res) => {
        if (cancelled) return;
        setProducts(Array.isArray(res.data) ? res.data : []);
        setLoadError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setProducts([]);
        setLoadError(err.message || "Products could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const list = products || [];
  const milk = list.filter((p) => p.category === "milk");
  const byproducts = list.filter((p) => p.category === "byproduct");

  const renderGrid = (items, emptyText) =>
    items.length ? (
      <div className="product-grid">
        {items.map((p) => <ProductCard key={p._id || p.name} p={p} />)}
      </div>
    ) : (
      <p className="note">{emptyText}</p>
    );

  return (
    <>
      <PageHero
        eyebrow="Dairy Products"
        title="Fresh Milk & Traditional Delights"
        subtitle="Everything made from the same pure, farm-fresh milk — with no preservatives and no shortcuts."
      />

      <section className="section">
        <div className="container">
          <div className="tabs">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={tab === t.key ? "active" : ""}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {products === null && <p className="note">Loading products...</p>}

          {loadError && <p className="note">{loadError}</p>}

          {products !== null && (
            <>
              {(tab === "all" || tab === "milk") && (
                <>
                  <div className="section-head left">
                    <h2>Fresh Milk</h2>
                    <p>Pasteurised, chilled and delivered within hours of milking.</p>
                  </div>
                  {renderGrid(milk, "No fresh milk products are listed yet.")}
                </>
              )}

              {(tab === "all" || tab === "byproduct") && (
                <>
                  <div className="section-head left mt">
                    <h2>Milk By-Products</h2>
                    <p>Curd, cream, buttermilk, lassi, ghee and more — made fresh in small batches.</p>
                  </div>
                  {renderGrid(byproducts, "No by-products are listed yet.")}
                </>
              )}
            </>
          )}

          <p className="note">Contact us for prices, daily subscriptions and bulk orders.</p>
        </div>
      </section>
    </>
  );
}
