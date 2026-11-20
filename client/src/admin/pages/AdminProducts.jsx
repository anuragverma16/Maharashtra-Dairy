import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import AdminIcon from "../components/AdminIcon.jsx";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";
import { fetchAdminProducts, deleteProduct } from "../services/adminApi.js";

export default function AdminProducts() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Set by the add/edit pages after saving
  const [notice, setNotice] = useState(location.state?.notice || null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminProducts({ search, category })
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, category]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      setError(null);
      await deleteProduct(product._id);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      setNotice(`"${product.name}" was deleted.`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-products">
        <div className="page-header">
          <h1>Products</h1>
          <Link to="/admin/products/add" className="btn btn-primary">
            <AdminIcon name="add" size={17} /> Add Product
          </Link>
        </div>

        {error && <div className="alert error">{error}</div>}
        {notice && <div className="alert success">{notice}</div>}

        <div className="filters">
          <input
            type="search"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-search"
            aria-label="Search products"
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-select" aria-label="Filter by category">
            <option value="">All Categories</option>
            <option value="milk">Milk</option>
            <option value="byproduct">By-Products</option>
          </select>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category === "milk" ? "Milk" : "By-Product"}</td>
                    <td>{product.price || "N/A"}</td>
                    <td>
                      <span className={`badge ${product.available ? "available" : "unavailable"}`}>
                        {product.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="actions">
                      <Link to={`/admin/products/${product._id}`} className="btn btn-sm btn-secondary">
                        Edit
                      </Link>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(product)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No products found</p>
        )}
      </div>
    </AdminLayout>
  );
}
