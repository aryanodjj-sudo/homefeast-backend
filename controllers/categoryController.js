import Category from "../models/Category.js";

// GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/categories (admin only)
export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error("Category name is required");
    }

    const exists = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (exists) {
      res.status(400);
      throw new Error("This category already exists");
    }

    const category = await Category.create({ name: name.trim() });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/categories/:id (admin only)
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    await category.deleteOne();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};