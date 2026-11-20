import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import ProductForm, { productToForm } from "../components/ProductForm.jsx";
import { getProductById, updateProduct } from "../services/adminApi.js";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProductById(id)
      .then((product) => {
        if (!cancelled) setInitial(productToForm(product));
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
  }, [id]);

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      setError(null);
      await updateProduct(id, payload);
      navigate("/admin/products", { state: { notice: "Product updated successfully." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading product...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!initial) {
    return (
      <AdminLayout>
        <div className="admin-form-page">
          <div className="alert error">{error || "Product not found."}</div>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/products")}>
            Back to products
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-form-page admin-form-page-wide">
        <div className="page-header">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h1>Edit product</h1>
            <p className="page-subtitle">{initial.name}</p>
          </div>
        </div>

        <ProductForm
          initialValues={initial}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          savingLabel="Saving..."
          saving={saving}
          error={error}
          onCancel={() => navigate("/admin/products")}
        />
      </div>
    </AdminLayout>
  );
}
