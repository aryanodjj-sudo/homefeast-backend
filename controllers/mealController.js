import Meal from "../models/Meal.js";

// GET /api/meals
export const getMeals = async (req, res, next) => {
  try {
    const meals = await Meal.find().sort({ createdAt: -1 });
    res.json(meals);
  } catch (error) {
    next(error);
  }
};

// GET /api/meals/:id
export const getMealById = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      res.status(404);
      throw new Error("Meal not found");
    }
    res.json(meal);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/meals (admin only)
export const createMeal = async (req, res, next) => {
  try {
    const meal = await Meal.create(req.body);
    res.status(201).json(meal);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/meals/:id (admin only)
export const updateMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      res.status(404);
      throw new Error("Meal not found");
    }

    Object.assign(meal, req.body);
    const updatedMeal = await meal.save();
    res.json(updatedMeal);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/meals/:id (admin only)
export const deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      res.status(404);
      throw new Error("Meal not found");
    }

    await meal.deleteOne();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};