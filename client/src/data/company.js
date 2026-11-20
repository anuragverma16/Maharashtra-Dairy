const phone = import.meta.env.VITE_COMPANY_PHONE || "+91-9930022119";
const email = import.meta.env.VITE_COMPANY_EMAIL || "bmainuddin30@gmail.com";

export const COMPANY = {
  name: "MAHARASHTRA DAIRY",
  marathi: "महाराष्ट्र डेयरी",
  tagline: "Pure • Fresh • Traditional",
  since: 2023,
  email,
  phone,
  // "+919930022119" — digits only, for tel: and wa.me links
  phoneLink: phone.replace(/[^+\d]/g, ""),
  address: ["Valsang Taluka", "District Solapur", "Maharashtra, India"],
  mapQuery: "Valsang, Solapur, Maharashtra",
};
