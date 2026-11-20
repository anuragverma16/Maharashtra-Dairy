import * as contactService from "../../services/contactService.js";

const toBool = (value) => (value === undefined ? undefined : value === "true" || value === true);

export const getAllContacts = async (req, res, next) => {
  try {
    const { isRead, isResolved, search } = req.query;
    const contacts = await contactService.getAllContacts({
      isRead: toBool(isRead),
      isResolved: toBool(isResolved),
      search,
    });
    res.json({ success: true, data: contacts });
  } catch (err) {
    next(err);
  }
};

export const getContactById = async (req, res, next) => {
  try {
    const contact = await contactService.getContactById(req.params.id);
    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const contact = await contactService.updateContact(req.params.id, req.body);
    res.json({ success: true, message: "Enquiry updated", data: contact });
  } catch (err) {
    next(err);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const contact = await contactService.deleteContact(req.params.id);
    res.json({ success: true, message: "Enquiry deleted", data: contact });
  } catch (err) {
    next(err);
  }
};

export const getContactStats = async (req, res, next) => {
  try {
    const stats = await contactService.getContactStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};
