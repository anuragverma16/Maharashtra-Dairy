import { apiRequest } from "../../lib/api.js";

const ADMIN = "/api/admin";

// Builds ?a=b&c=d and skips empty values
function query(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.append(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : "";
}

// Turns "a, b, ,c" from a text box into ["a", "b", "c"]
export function toList(text) {
  if (Array.isArray(text)) return text;
  return String(text || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

// ---------- Auth ----------
export async function fetchAdminProfile() {
  const res = await apiRequest(`${ADMIN}/auth/me`);
  return res.admin;
}

// ---------- Products ----------
export async function fetchAdminProducts({ search, category } = {}) {
  const res = await apiRequest(`${ADMIN}/products${query({ search, category })}`);
  return res.data;
}

// Uploads one photo; resolves to { url, publicId }
export async function uploadProductImage(file) {
  const form = new FormData();
  form.append("image", file);
  const res = await apiRequest(`${ADMIN}/products/image`, { method: "POST", body: form });
  return res.data;
}

export async function fetchAdminProductStats() {
  const res = await apiRequest(`${ADMIN}/products/stats`);
  return res.data;
}

export async function getProductById(id) {
  const res = await apiRequest(`${ADMIN}/products/${id}`);
  return res.data;
}

export async function createProduct(product) {
  const res = await apiRequest(`${ADMIN}/products`, { method: "POST", body: product });
  return res.data;
}

export async function updateProduct(id, product) {
  const res = await apiRequest(`${ADMIN}/products/${id}`, { method: "PUT", body: product });
  return res.data;
}

export async function deleteProduct(id) {
  const res = await apiRequest(`${ADMIN}/products/${id}`, { method: "DELETE" });
  return res.data;
}

// ---------- Enquiries ----------
// `resolved`: true | false | undefined (undefined = all)
export async function fetchAdminContacts({ search, resolved } = {}) {
  const res = await apiRequest(`${ADMIN}/contacts${query({ search, isResolved: resolved })}`);
  return res.data;
}

export async function fetchAdminContactStats() {
  const res = await apiRequest(`${ADMIN}/contacts/stats`);
  return res.data;
}

export async function updateContact(id, changes) {
  const res = await apiRequest(`${ADMIN}/contacts/${id}`, { method: "PUT", body: changes });
  return res.data;
}

export async function deleteContact(id) {
  const res = await apiRequest(`${ADMIN}/contacts/${id}`, { method: "DELETE" });
  return res.data;
}

// ---------- Site content ----------
export async function fetchSiteContent() {
  const res = await apiRequest(`${ADMIN}/content`);
  return res.data;
}

export async function updateContent(section, content) {
  const res = await apiRequest(`${ADMIN}/content/${section}`, {
    method: "PUT",
    body: { content },
  });
  return res.data;
}

// ---------- Dashboard ----------
export async function fetchDashboardStats() {
  const [products, contacts] = await Promise.all([
    fetchAdminProductStats(),
    fetchAdminContactStats(),
  ]);
  return {
    totalProducts: products.totalProducts,
    availableProducts: products.availableProducts,
    unavailableProducts: products.unavailableProducts,
    totalEnquiries: contacts.totalContacts,
    unreadEnquiries: contacts.unreadContacts,
    unresolvedEnquiries: contacts.unresolvedContacts,
  };
}
