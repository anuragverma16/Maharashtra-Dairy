import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import { validateEmail } from "../config/db.js";

const PHONE_RE = /^\+?[0-9\s-]{7,20}$/;

const httpError = (status, message) => Object.assign(new Error(message), { status });
const clean = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const assertId = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(400, message);
};

export const createContact = async (data = {}) => {
  const name = clean(data.name, 100);
  const email = clean(data.email, 150).toLowerCase();
  const phone = clean(data.phone, 20);
  const subject = clean(data.subject, 100);
  const message = clean(data.message, 2000);

  const errors = [];
  if (!name) errors.push("Name is required");
  if (!validateEmail(email)) errors.push("A valid email is required");
  if (phone && !PHONE_RE.test(phone)) errors.push("Mobile number looks invalid");
  if (message.length < 5) errors.push("Message must be at least 5 characters");
  if (errors.length) throw httpError(400, errors.join(". "));

  return Contact.create({
    name,
    email,
    phone: phone || undefined,
    subject: subject || undefined,
    message,
  });
};

export const getAllContacts = async (filters = {}) => {
  const { isRead, isResolved, search } = filters;
  const filter = {};

  if (typeof isRead === "boolean") filter.isRead = isRead;
  if (typeof isResolved === "boolean") filter.isResolved = isResolved;

  const term = clean(search, 100);
  if (term) {
    const pattern = { $regex: escapeRegex(term), $options: "i" };
    filter.$or = [{ name: pattern }, { email: pattern }, { message: pattern }];
  }

  return Contact.find(filter).sort({ createdAt: -1 });
};

export const getContactById = async (id) => {
  assertId(id, "Invalid contact ID");

  const contact = await Contact.findById(id);
  if (!contact) throw httpError(404, "Enquiry not found");

  if (!contact.isRead) {
    contact.isRead = true;
    await contact.save();
  }

  return contact;
};

// Only the flags the admin can change; everything else in the body is ignored
export const updateContact = async (id, updateData = {}) => {
  assertId(id, "Invalid contact ID");

  const changes = {};
  if (typeof updateData.isRead === "boolean") changes.isRead = updateData.isRead;
  if (typeof updateData.isResolved === "boolean") changes.isResolved = updateData.isResolved;
  if (!Object.keys(changes).length) throw httpError(400, "Nothing to update");

  const contact = await Contact.findByIdAndUpdate(id, changes, { new: true });
  if (!contact) throw httpError(404, "Enquiry not found");

  return contact;
};

export const deleteContact = async (id) => {
  assertId(id, "Invalid contact ID");

  const contact = await Contact.findByIdAndDelete(id);
  if (!contact) throw httpError(404, "Enquiry not found");

  return contact;
};

export const getContactStats = async () => {
  const [total, unread, unresolved] = await Promise.all([
    Contact.countDocuments(),
    Contact.countDocuments({ isRead: false }),
    Contact.countDocuments({ isResolved: false }),
  ]);

  return { totalContacts: total, unreadContacts: unread, unresolvedContacts: unresolved };
};
