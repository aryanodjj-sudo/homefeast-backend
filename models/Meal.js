import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isVeg: { type: Boolean, default: true },
    chefId: { type: Number, default: null },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Meal = mongoose.model("Meal", mealSchema);
export default Meal;