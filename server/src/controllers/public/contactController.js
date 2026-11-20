import * as contactService from "../../services/contactService.js";

export const createContact = async (req, res, next) => {
  try {
    // Honeypot: real visitors never fill the hidden "website" field, bots often do.
    // Pretend success so the bot gets no signal, but store nothing.
    if (req.body?.website) {
      return res.status(201).json({ success: true, message: "Thank you! We have received your message." });
    }

    const contact = await contactService.createContact(req.body);
    res.status(201).json({
      success: true,
      message: "Thank you! We have received your message.",
      data: { id: contact._id, name: contact.name, createdAt: contact.createdAt },
    });
  } catch (err) {
    next(err);
  }
};
