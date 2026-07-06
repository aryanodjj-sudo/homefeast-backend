import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Meal from "../models/Meal.js";
import Category from "../models/Category.js";

dotenv.config();

// Same catalog as the frontend's src/data/meals.js, so the storefront looks
// identical whether it's reading from mock localStorage or this real DB.
const meals = [
  { name: "Paneer Butter Masala", category: "Indian", price: 250, rating: 4.8, isVeg: true, chefId: 1, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950", description: "Soft paneer cubes simmered in a rich, creamy tomato-butter gravy, finished with a touch of cream and kasuri methi. A North Indian favourite best enjoyed with butter naan or steamed rice." },
  { name: "Veg Biryani", category: "Rice", price: 180, rating: 4.7, isVeg: true, chefId: 1, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0", description: "Fragrant basmati rice layered and dum-cooked with mixed vegetables, whole spices, and fried onions. Served with raita on the side for a complete, comforting meal." },
  { name: "Masala Dosa", category: "South Indian", price: 120, rating: 4.6, isVeg: true, chefId: 2, image: "https://images.unsplash.com/photo-1630383249896-424e482df921", description: "A crisp, golden rice-and-lentil crepe folded over a spiced potato filling, served with coconut chutney and piping hot sambar." },
  { name: "Butter Chicken", category: "Indian", price: 280, rating: 4.9, isVeg: false, chefId: 1, image: "https://images.unsplash.com/photo-1742599361498-79824d24e355", description: "Tender tandoor-grilled chicken simmered in a velvety, mildly spiced tomato-butter sauce. A restaurant classic, made the homemade way." },
  { name: "Idli Sambhar", category: "South Indian", price: 100, rating: 4.5, isVeg: true, chefId: 2, image: "https://images.unsplash.com/photo-1741376509187-0b683c764294", description: "Soft, steamed rice cakes served with a hearty lentil-and-vegetable sambhar and fresh coconut chutney. A light, wholesome South Indian breakfast classic." },
  { name: "Pav Bhaji", category: "Snacks", price: 140, rating: 4.6, isVeg: true, image: "https://images.unsplash.com/photo-1753357303396-704b5abe8945", description: "A buttery, spiced mash of mixed vegetables served with soft, toasted pav buns, chopped onions, and a wedge of lemon. Classic Mumbai street food, made fresh at home." },
  { name: "Gulab Jamun", category: "Desserts", price: 90, rating: 4.8, isVeg: true, image: "https://images.unsplash.com/photo-1593701461250-d7b22dfd3a77", description: "Soft, golden khoya dumplings soaked in warm cardamom-and-rose sugar syrup. A classic Indian dessert that rounds off any meal on a sweet note." },
  { name: "Mango Lassi", category: "Beverages", price: 80, rating: 4.7, isVeg: true, image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4", description: "A thick, chilled yogurt smoothie blended with sweet Alphonso mango pulp. Refreshing, cooling, and the perfect companion to a spicy meal." },
];

const categories = ["Indian", "Rice", "South Indian", "Snacks", "Desserts", "Beverages"];

const seedData = async () => {
  try {
    await connectDB();

    // Seed admin - skipped if it already exists, so re-running this script
    // never duplicates the admin account or errors on the unique email index.
    const adminExists = await User.findOne({ email: process.env.SEED_ADMIN_EMAIL });
    if (!adminExists) {
      await User.create({
        name: process.env.SEED_ADMIN_NAME || "Admin",
        email: process.env.SEED_ADMIN_EMAIL || "admin@homefeast.com",
        password: process.env.SEED_ADMIN_PASSWORD || "admin123",
        role: "admin",
      });
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists, skipping");
    }

    // Wipe and reseed catalog data every run, so the menu always matches
    // the arrays above exactly.
    await Meal.deleteMany();
    await Category.deleteMany();

    await Category.insertMany(categories.map((name) => ({ name })));
    await Meal.insertMany(meals);

    console.log("Meals and categories seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();