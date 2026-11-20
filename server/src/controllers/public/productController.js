import * as productService from "../../services/productService.js";

export const getAllProducts = async (req, res, next) => {
  try {
    const { category } = req.query;
    const products = await productService.getPublicProducts(category);
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};
