import { useEffect, useState } from "react";
import PageHero from "../components/PageHero.jsx";
import ProductCard from "../components/ProductCard.jsx";
import fallbackProducts from "../data/products.js";
import { apiRequest } from "../lib/api.js";

const tabs = [
  { key: "all", label: "All Products" },
  { key: "milk", label: "Milk" },
  { key: "byproduct", label: "Milk By-Products" },
];

export default function Products() {
  // null = still loading; [] = the database has no products yet
  const [products, setProducts] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    let cancelled = false;
    // The API answers { success, data: [...] } straight from the database.
    // Only if the server cannot be reached do we show the built-in list.
    apiRequest("/api/products")
      .then((res) => {
        if (cancelled) return;
        setProducts(Array.isArray(res.data) ? res.data : []);
        setUsingFallback(false);
      })
      .catch(() => {
        if (cancelled) return;
        setProducts(fallbackProducts);
        setUsingFallback(true);
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

          {usingFallback && (
            <p className="note">We are showing our standard range while the product list is unavailable.</p>
          )}

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
