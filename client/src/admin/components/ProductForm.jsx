import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/ProductCard.jsx";
import { toList, uploadProductImage } from "../services/adminApi.js";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const EMPTY_PRODUCT = {
  name: "",
  marathiName: "",
  sku: "",
  category: "milk",
  tagline: "",
  price: "",
  sizes: "", // comma-separated text
  fatContent: "",
  packaging: "",
  description: "",
  benefits: "", // comma-separated text
  badges: "", // comma-separated text
  shelfLife: "",
  storage: "",
  featured: false,
  displayOrder: 0,
  available: true,
};

// Stored product -> editable form values (arrays become comma-separated text)
export function productToForm(product = {}) {
  return {
    ...EMPTY_PRODUCT,
    name: product.name || "",
    marathiName: product.marathiName || "",
    sku: product.sku || "",
    category: product.category || "milk",
    tagline: product.tagline || "",
    price: product.price || "",
    sizes: (product.sizes || []).join(", "),
    fatContent: product.fatContent || "",
    packaging: product.packaging || "",
    description: product.description || "",
    benefits: (product.benefits || []).join(", "),
    badges: (product.badges || []).join(", "),
    shelfLife: product.shelfLife || "",
    storage: product.storage || "",
    featured: Boolean(product.featured),
    displayOrder: product.displayOrder ?? 0,
    available: product.available !== false,
  };
}

// Form values -> API payload
export function formToPayload(values) {
  const text = (value) => String(value ?? "").trim();
  return {
    name: text(values.name),
    marathiName: text(values.marathiName),
    sku: text(values.sku),
    category: values.category,
    tagline: text(values.tagline),
    price: text(values.price),
    sizes: toList(values.sizes),
    fatContent: text(values.fatContent),
    packaging: text(values.packaging),
    description: text(values.description),
    benefits: toList(values.benefits),
    badges: toList(values.badges),
    shelfLife: text(values.shelfLife),
    storage: text(values.storage),
    featured: Boolean(values.featured),
    displayOrder: values.displayOrder === "" ? 0 : Number(values.displayOrder),
    available: Boolean(values.available),
  };
}

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Product name is required.";
  if (!values.category) errors.category = "Choose a category.";
  const order = Number(values.displayOrder);
  if (values.displayOrder !== "" && (!Number.isInteger(order) || order < 0)) {
    errors.displayOrder = "Enter a whole number, 0 or more.";
  }
  return errors;
}

export default function ProductForm({
  initialValues = EMPTY_PRODUCT,
  onSubmit,
  submitLabel = "Save product",
  savingLabel = "Saving...",
  saving = false,
  error = null,
  onCancel,
}) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});

  // Photo: `image` is the saved { url, publicId } (or null); `imageFile` is a new pick, uploaded on save
  const [image, setImage] = useState(initialValues.image || null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialValues.image?.url || null);
  const [imageError, setImageError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Free the temporary preview URL when it changes or the form closes
  useEffect(() => {
    if (!imageFile) return undefined;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const preview = useMemo(() => {
    const payload = formToPayload(values);
    return {
      ...payload,
      name: payload.name || "Product name",
      displayOrder: Number.isFinite(payload.displayOrder) ? payload.displayOrder : 0,
      image: imagePreview ? { url: imagePreview } : null,
    };
  }, [values, imagePreview]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setImageError("Only JPG, PNG or WebP images are allowed.");
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setImageError("Image must be smaller than 5 MB.");
      return;
    }
    setImageError(null);
    setImageFile(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImage(null);
    setImagePreview(null);
    setImageError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    let photo = image;
    if (imageFile) {
      try {
        setUploading(true);
        setImageError(null);
        photo = await uploadProductImage(imageFile);
      } catch (err) {
        setImageError(err.message);
        return;
      } finally {
        setUploading(false);
      }
    }
    onSubmit({ ...formToPayload(values), image: photo });
  };

  const fieldError = (name) => (fieldErrors[name] ? <span className="field-error">{fieldErrors[name]}</span> : null);

  return (
    <form onSubmit={handleSubmit} className="product-form" noValidate>
      <div className="product-form-main">
        {error && <div className="alert error">{error}</div>}

        <section className="form-section">
          <header className="form-section-head">
            <h2>Product photo</h2>
            <p>JPG, PNG or WebP, up to 5 MB. Stored securely on Cloudinary.</p>
          </header>
          <div className="photo-field">
            {imagePreview ? (
              <img className="photo-preview" src={imagePreview} alt="Selected product" />
            ) : (
              <div className="photo-empty" aria-hidden="true">No photo yet</div>
            )}
            <div className="photo-actions">
              <label className="btn btn-secondary photo-pick">
                {imagePreview ? "Change photo" : "Choose photo"}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImagePick} hidden />
              </label>
              {imagePreview && (
                <button type="button" className="btn btn-secondary" onClick={removeImage}>Remove photo</button>
              )}
              {imageFile && <span className="field-hint">Will upload when you save.</span>}
            </div>
            {imageError && <span className="field-error">{imageError}</span>}
          </div>
        </section>

        <section className="form-section">
          <header className="form-section-head">
            <h2>Basic information</h2>
            <p>How the product is named and identified.</p>
          </header>
          <div className="form-row">
            <div className={`form-group ${fieldErrors.name ? "has-error" : ""}`}>
              <label htmlFor="name">Product name *</label>
              <input id="name" type="text" name="name" value={values.name} onChange={handleChange} placeholder="e.g., Full Cream Cow Milk" />
              {fieldError("name")}
            </div>
            <div className="form-group">
              <label htmlFor="marathiName">Marathi name</label>
              <input id="marathiName" type="text" name="marathiName" value={values.marathiName} onChange={handleChange} placeholder="e.g., गाईचे दूध" />
            </div>
          </div>
          <div className="form-row">
            <div className={`form-group ${fieldErrors.category ? "has-error" : ""}`}>
              <label htmlFor="category">Category *</label>
              <select id="category" name="category" value={values.category} onChange={handleChange}>
                <option value="milk">Fresh Milk</option>
                <option value="byproduct">Milk By-Product</option>
              </select>
              {fieldError("category")}
            </div>
            <div className="form-group">
              <label htmlFor="sku">SKU / product code</label>
              <input id="sku" type="text" name="sku" value={values.sku} onChange={handleChange} placeholder="e.g., MD-MLK-001" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="tagline">Tagline</label>
            <input id="tagline" type="text" name="tagline" value={values.tagline} onChange={handleChange} maxLength={120} placeholder="One line shown under the name, e.g., Chilled within minutes of milking" />
            <span className="field-hint">Shown on the product card. Up to 120 characters.</span>
          </div>
        </section>

        <section className="form-section">
          <header className="form-section-head">
            <h2>Pricing & packs</h2>
            <p>What customers pay and which sizes are available.</p>
          </header>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input id="price" type="text" name="price" value={values.price} onChange={handleChange} placeholder="e.g., ₹30 / 500 ml" />
            </div>
            <div className="form-group">
              <label htmlFor="fatContent">Fat content</label>
              <input id="fatContent" type="text" name="fatContent" value={values.fatContent} onChange={handleChange} placeholder="e.g., 4.5% min" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="sizes">Pack sizes</label>
            <input id="sizes" type="text" name="sizes" value={values.sizes} onChange={handleChange} placeholder="e.g., 500 ml, 1 L" />
            <span className="field-hint">Separate sizes with commas.</span>
          </div>
        </section>

        <section className="form-section">
          <header className="form-section-head">
            <h2>Product details</h2>
            <p>Description, highlights and handling information.</p>
          </header>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={values.description} onChange={handleChange} rows="4" placeholder="Describe the product, where it comes from and how it is made." />
          </div>
          <div className="form-group">
            <label htmlFor="benefits">Key benefits</label>
            <textarea id="benefits" name="benefits" value={values.benefits} onChange={handleChange} rows="2" placeholder="e.g., High in calcium, Full of protein, No preservatives" />
            <span className="field-hint">Separate benefits with commas. Each one appears as a tick point.</span>
          </div>
          <div className="form-group">
            <label htmlFor="badges">Badges</label>
            <input id="badges" type="text" name="badges" value={values.badges} onChange={handleChange} placeholder="e.g., Farm fresh, Pure, Traditional" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="shelfLife">Shelf life</label>
              <input id="shelfLife" type="text" name="shelfLife" value={values.shelfLife} onChange={handleChange} placeholder="e.g., 24 hours refrigerated" />
            </div>
            <div className="form-group">
              <label htmlFor="storage">Storage</label>
              <input id="storage" type="text" name="storage" value={values.storage} onChange={handleChange} placeholder="e.g., Keep at 2–4 °C" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="packaging">Packaging</label>
            <input id="packaging" type="text" name="packaging" value={values.packaging} onChange={handleChange} placeholder="e.g., HDPE bottle, Pouch" />
          </div>
        </section>

        <section className="form-section">
          <header className="form-section-head">
            <h2>Display & visibility</h2>
            <p>Control where and how the product shows on the website.</p>
          </header>
          <div className="form-row">
            <div className={`form-group ${fieldErrors.displayOrder ? "has-error" : ""}`}>
              <label htmlFor="displayOrder">Display order</label>
              <input id="displayOrder" type="number" min="0" step="1" name="displayOrder" value={values.displayOrder} onChange={handleChange} />
              {fieldError("displayOrder")}
              <span className="field-hint">Lower numbers appear first.</span>
            </div>
          </div>
          <div className="toggle-row">
            <label className="checkbox-label">
              <input type="checkbox" name="available" checked={values.available} onChange={handleChange} />
              Available for sale
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="featured" checked={values.featured} onChange={handleChange} />
              Feature on the products page
            </label>
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
            {uploading ? "Uploading photo..." : saving ? savingLabel : submitLabel}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>

      <aside className="product-form-preview" aria-label="Live preview">
        <div className="preview-label">Live preview</div>
        <p className="preview-hint">This is how the product card looks on the website.</p>
        <div className="preview-frame">
          <ProductCard p={preview} />
        </div>
      </aside>
    </form>
  );
}
