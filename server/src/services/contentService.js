import SiteContent from "../models/SiteContent.js";
import { SITE_SECTIONS } from "../config/db.js";

const httpError = (status, message) => Object.assign(new Error(message), { status });

const assertSection = (section) => {
  if (!Object.values(SITE_SECTIONS).includes(section)) throw httpError(400, "Invalid section");
};

export const getContentBySection = async (section) => {
  assertSection(section);

  let content = await SiteContent.findOne({ section });
  if (!content) {
    content = await SiteContent.create({ section, content: "" });
  }

  return content;
};

export const updateContent = async (section, content, updatedBy) => {
  assertSection(section);

  const text = typeof content === "string" ? content : String(content ?? "");

  return await SiteContent.findOneAndUpdate(
    { section },
    { content: text, lastUpdatedBy: updatedBy },
    { new: true, upsert: true, runValidators: true }
  );
};

export const getAllContent = async () => {
  return await SiteContent.find().sort({ section: 1 });
};
