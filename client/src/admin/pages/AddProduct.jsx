import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import ProductForm, { EMPTY_PRODUCT } from "../components/ProductForm.jsx";
import { createProduct } from "../services/adminApi.js";

export default function AddProduct() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      setError(null);
      await createProduct(payload);
      navigate("/admin/products", { state: { notice: "Product created successfully." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-form-page admin-form-page-wide">
        <div className="page-header">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h1>Add new product</h1>
            <p className="page-subtitle">Fill in the details below. The preview updates as you type.</p>
          </div>
        </div>

        <ProductForm
          initialValues={EMPTY_PRODUCT}
          onSubmit={handleSubmit}
          submitLabel="Create product"
          savingLabel="Creating..."
          saving={saving}
          error={error}
          onCancel={() => navigate("/admin/products")}
        />
      </div>
    </AdminLayout>
  );
}
