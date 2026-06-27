const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Food = require("../models/Food");

const DEFAULT_MENU = [
  // All Time Favorites
  { name: 'Poha', price: 40, category: 'All Time Favorites', emoji: '🍛', img: 'poha.jpg' },
  { name: 'Upma', price: 30, category: 'All Time Favorites', emoji: '🍲', img: 'upma.png' },
  { name: 'Vada Pav', price: 25, category: 'All Time Favorites', emoji: '🍔', img: 'vadapav.png' },
  { name: 'Idli (2 pc)', price: 30, category: 'All Time Favorites', emoji: '🥟', img: 'idli.png' },
  { name: 'Plain Dosa', price: 40, category: 'All Time Favorites', emoji: '🥞', img: 'plain_dosa.png' },
  { name: 'Masala Dosa', price: 50, category: 'All Time Favorites', emoji: '🌮', img: 'masala_dosa.png' },
  { name: 'Pav Bhaji', price: 70, category: 'All Time Favorites', emoji: '🥘', img: 'pavbhaji.jpg' },
  { name: 'Misal Pav', price: 60, category: 'All Time Favorites', emoji: '🍛', img: 'misalpav.png' },
  { name: 'Masala Maggi', price: 40, category: 'All Time Favorites', emoji: '🍜', img: 'masala_maggi.png' },
  { name: 'Plain Maggi', price: 30, category: 'All Time Favorites', emoji: '🍜', img: 'plain_maggi.png' },
  { name: 'Cheese Maggi', price: 50, category: 'All Time Favorites', emoji: '🧀', img: 'cheese_maggi.png' },
  { name: 'Vegetable Maggi', price: 50, category: 'All Time Favorites', emoji: '🥗', img: 'veg_maggi.png' },

  // Pizza & Burger
  { name: 'Veg Burger', price: 60, category: 'Pizza & Burger', emoji: '🍔', img: 'veg_burger.png' },
  { name: 'Aloo Tikki Burger', price: 50, category: 'Pizza & Burger', emoji: '🍔', img: 'aloo_tikki_burger.png' },
  { name: 'Double Cheese Burger', price: 80, category: 'Pizza & Burger', emoji: '🍔', img: 'double_cheese_burger.png' },
  { name: 'Paneer Makhani Burger', price: 90, category: 'Pizza & Burger', emoji: '🍔', img: 'paneer_makhani_burger.png' },
  { name: 'Plain Cheese Pizza', price: 100, category: 'Pizza & Burger', emoji: '🍕', img: 'plain_cheese_pizza.png' },
  { name: 'Veg Paneer Pizza', price: 140, category: 'Pizza & Burger', emoji: '🍕', img: 'veg_paneer_pizza.png' },
  { name: 'Margherita Pizza', price: 140, category: 'Pizza & Burger', emoji: '🍕', img: 'margheritapizza.png' },
  { name: 'Corn & Cheese Pizza', price: 130, category: 'Pizza & Burger', emoji: '🍕', img: 'cornpizza.jpg' },

  // Fries / Nuggets / Momos
  { name: 'Classic French Fries', price: 60, category: 'Fries / Nuggets / Momos', emoji: '🍟', img: 'classic_fries.png' },
  { name: 'Peri Peri Fries', price: 80, category: 'Fries / Nuggets / Momos', emoji: '🍟', img: 'peri_peri_fries.png' },
  { name: 'Loaded Cheese Fries', price: 110, category: 'Fries / Nuggets / Momos', emoji: '🧀', img: 'cheese_fries.png' },
  { name: 'Veg Steamed Momos', price: 60, category: 'Fries / Nuggets / Momos', emoji: '🥟', img: 'steamed_momos.png' },
  { name: 'Fried Paneer Momos', price: 90, category: 'Fries / Nuggets / Momos', emoji: '🥟', img: 'fried_paneer_momos.png' },
  { name: 'Tandoori Momos', price: 110, category: 'Fries / Nuggets / Momos', emoji: '🥟', img: 'tandoori_momos.png' },
  { name: 'Veg Nuggets', price: 80, category: 'Fries / Nuggets / Momos', emoji: '🍘', img: 'veg_nuggets.png' },
  { name: 'Chicken Nuggets', price: 100, category: 'Fries / Nuggets / Momos', emoji: '🍗', img: 'chicken_nuggets.png' },

  // Hot Beverages / Tea
  { name: 'Normal Tea', price: 15, category: 'Hot Beverages / Tea', emoji: '🍵', img: 'normal_tea.png' },
  { name: 'Special Masala Tea', price: 20, category: 'Hot Beverages / Tea', emoji: '☕', img: 'masala_tea.png' },
  { name: 'Hot Coffee', price: 30, category: 'Hot Beverages / Tea', emoji: '☕', img: 'hot_coffee.png' },
  { name: 'Hot Chocolate', price: 50, category: 'Hot Beverages / Tea', emoji: '☕', img: 'hot_chocolate.png' },
  { name: 'Cold Coffee', price: 60, category: 'Hot Beverages / Tea', emoji: '🧋', img: 'cold_coffee.png' },

  // Chinese
  { name: 'Veg Hakka Noodles', price: 90, category: 'Chinese', emoji: '🍜', img: 'veg_hakka_noodles.png' },
  { name: 'Veg Fried Rice', price: 100, category: 'Chinese', emoji: '🍚', img: 'veg_fried_rice.png' },
  { name: 'Veg Manchurian', price: 110, category: 'Chinese', emoji: '🥢', img: 'veg_manchurian.png' },
  { name: 'Schezwan Rice', price: 120, category: 'Chinese', emoji: '🍚', img: 'schezwan_rice.png' },

  // Thali
  { name: 'Mini Veg Thali', price: 90, category: 'Thali', emoji: '🍛', img: 'mini_veg_thali.png' },
  { name: 'Special Veg Thali', price: 150, category: 'Thali', emoji: '🍱', img: 'special_veg_thali.png' },
  { name: 'Chole Bhature', price: 100, category: 'Thali', emoji: '🍛', img: 'chole_bhature.png' },
  { name: 'Plain Rice', price: 40, category: 'Thali', emoji: '🍚', img: 'plain_rice.png' },
];

const seedDatabase = async () => {
  try {
    console.log("Seeding started...");

    // 1. Seed Admin User
    const adminExists = await User.findOne({ email: "admin@canteen.in" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    if (!adminExists) {
      await User.create({
        name: "Admin Canteen",
        email: "admin@canteen.in",
        password: hashedPassword,
        roll: "ADMIN",
        department: "Canteen",
        role: "admin",
      });
      console.log("✓ Admin user seeded (admin@canteen.in / admin123)");
    } else if (!adminExists.password.startsWith("$2a$")) {
      adminExists.password = hashedPassword;
      await adminExists.save();
      console.log("✓ Legacy Admin plain-text password upgraded to secure hash.");
    } else {
      console.log("Admin user already exists with hashed password.");
    }



    // 3. Seed Menu Items
    const foodCount = await Food.countDocuments();
    if (foodCount === 0) {
      const foodsToSeed = DEFAULT_MENU.map((item) => ({
        name: item.name,
        price: item.price,
        category: item.category,
        description: `${item.emoji} Freshly prepared ${item.name}`,
        image: item.img, // filename stored
        inStock: true,
      }));
      await Food.insertMany(foodsToSeed);
      console.log(`✓ Seeded ${foodsToSeed.length} menu items into database`);
    } else {
      console.log(`Foods collection already has ${foodCount} items. Skipping menu seeding.`);
    }

    console.log("Seeding execution completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

module.exports = seedDatabase;
