import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Meal from "../models/Meal.js";
import Category from "../models/Category.js";

dotenv.config();

// Same catalog as the frontend's src/data/meals.js, so the storefront looks
// identical whether it's reading from mock localStorage or this real DB.
// Thali images are sourced from Wikimedia Commons - filenames there match
// the actual dish (e.g. "Vegetarian_Thali.jpg"), which is far more reliable
// than a generic stock-photo caption.
const meals = [
  { name: "Paneer Butter Masala", category: "Indian", price: 250, originalPrice: 349, rating: 4.8, isVeg: true, chefId: 1, image: "https://www.ruchiskitchen.com/wp-content/uploads/2020/12/Paneer-butter-masala-recipe-3-500x375.jpg", description: "Soft paneer cubes simmered in a rich, creamy tomato-butter gravy, finished with a touch of cream and kasuri methi. A North Indian favourite best enjoyed with butter naan or steamed rice." },
  { name: "Veg Biryani", category: "Rice", price: 180, originalPrice: 249, rating: 4.7, isVeg: true, chefId: 1, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0", description: "Fragrant basmati rice layered and dum-cooked with mixed vegetables, whole spices, and fried onions. Served with raita on the side for a complete, comforting meal." },
  { name: "Masala Dosa", category: "South Indian", price: 120, originalPrice: 169, rating: 4.6, isVeg: true, chefId: 2, image: "https://images.unsplash.com/photo-1630383249896-424e482df921", description: "A crisp, golden rice-and-lentil crepe folded over a spiced potato filling, served with coconut chutney and piping hot sambar." },
  { name: "Butter Chicken", category: "Indian", price: 280, originalPrice: 399, rating: 4.9, isVeg: false, chefId: 1, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvmEnRF4HkesEXJXnZThxJ4MkVfN6j-taF5BYwqCcC2Q&s=10", description: "Tender tandoor-grilled chicken simmered in a velvety, mildly spiced tomato-butter sauce. A restaurant classic, made the homemade way." },
  { name: "Idli Sambhar", category: "South Indian", price: 100, originalPrice: 139, rating: 4.5, isVeg: true, chefId: 2, image: "https://images.unsplash.com/photo-1741376509187-0b683c764294", description: "Soft, steamed rice cakes served with a hearty lentil-and-vegetable sambhar and fresh coconut chutney. A light, wholesome South Indian breakfast classic." },
  { name: "Pav Bhaji", category: "Snacks", price: 140, originalPrice: 199, rating: 4.6, isVeg: true, image: "https://images.unsplash.com/photo-1753357303396-704b5abe8945", description: "A buttery, spiced mash of mixed vegetables served with soft, toasted pav buns, chopped onions, and a wedge of lemon. Classic Mumbai street food, made fresh at home." },
  { name: "Gulab Jamun", category: "Desserts", price: 90, originalPrice: 129, rating: 4.8, isVeg: true, image: "https://images.unsplash.com/photo-1593701461250-d7b22dfd3a77", description: "Soft, golden khoya dumplings soaked in warm cardamom-and-rose sugar syrup. A classic Indian dessert that rounds off any meal on a sweet note." },
  { name: "Mango Lassi", category: "Beverages", price: 80, originalPrice: 109, rating: 4.7, isVeg: true, image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4", description: "A thick, chilled yogurt smoothie blended with sweet Alphonso mango pulp. Refreshing, cooling, and the perfect companion to a spicy meal." },

  // --- Thali combos ---------------------------------------------------
  { name: "Classic Veg Thali", category: "Thali", price: 220, originalPrice: 299, rating: 4.6, isVeg: true, chefId: 1, image: "https://commons.wikimedia.org/wiki/Special:FilePath/Vegetarian_Thali.jpg", description: "A complete home-style meal: Dal Tadka, Mix Veg Sabzi, Jeera Rice, 3 Tawa Rotis, fresh salad, papad, and a sweet Gulab Jamun to finish." },
  { name: "Punjabi Thali", category: "Thali", price: 260, originalPrice: 359, rating: 4.7, isVeg: true, chefId: 1, image: "https://commons.wikimedia.org/wiki/Special:FilePath/Veg_Punjabi_Thaali.jpg", description: "Rich Punjabi-style Dal Makhani, Paneer Sabzi, Jeera Rice, and buttery Tawa Roti, served with a glass of chilled Lassi." },
  { name: "South Indian Thali", category: "Thali", price: 200, originalPrice: 279, rating: 4.6, isVeg: true, chefId: 2, image: "https://commons.wikimedia.org/wiki/Special:FilePath/An_ideal_South_Indian_Thali.jpg", description: "Sambar, Rasam, Avial, and Poriyal served with steamed rice, crispy papadum, and a sweet Payasam — a full Sadhya-style vegetarian spread." },
  { name: "Chicken Thali", category: "Thali", price: 320, originalPrice: 449, rating: 4.8, isVeg: false, chefId: 1, image: "https://commons.wikimedia.org/wiki/Special:FilePath/Non_veg_thali.jpg", description: "Butter Chicken and a spiced Chicken Curry, paired with Dal, Jeera Rice, 2 Rotis, fresh salad, and cooling raita." },
  { name: "Mutton Thali", category: "Thali", price: 380, originalPrice: 529, rating: 4.8, isVeg: false, chefId: 1, image: "https://commons.wikimedia.org/wiki/Special:FilePath/India_non_veg_thali.jpg", description: "Slow-cooked Mutton Curry with Dal Fry, steamed rice, soft roti, onion salad, and pickle — a rich, hearty non-veg thali." },
  { name: "Bengali Fish Thali", category: "Thali", price: 300, originalPrice: 419, rating: 4.7, isVeg: false, chefId: 2, image: "https://commons.wikimedia.org/wiki/Special:FilePath/Bengali_Non-vegetarian_thali.jpg", description: "Traditional Bengali Fish Curry with steamed rice, Dal, Aloo Bhaja, and a serving of Mishti Doi to end on a sweet note." },
];

const categories = ["Indian", "Rice", "South Indian", "Snacks", "Desserts", "Beverages", "Thali"];

const seedData = async () => {
  try {
    await connectDB();

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