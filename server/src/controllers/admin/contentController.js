import * as contentService from "../../services/contentService.js";

export const getContentBySection = async (req, res, next) => {
  try {
    const { section } = req.params;
    const content = await contentService.getContentBySection(section);
    res.json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
};

export const updateContent = async (req, res, next) => {
  try {
    const { section } = req.params;
    const { content } = req.body;
    const updated = await contentService.updateContent(section, content, req.adminEmail);
    res.json({ success: true, message: "Content updated", data: updated });
  } catch (err) {
    next(err);
  }
};

export const getAllContent = async (req, res, next) => {
  try {
    const content = await contentService.getAllContent();
    res.json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
};
