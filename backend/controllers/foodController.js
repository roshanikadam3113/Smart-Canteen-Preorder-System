const Food = require("../models/Food");

// @desc    Get all food items
// @route   GET /foods
// @access  Public
const getFoods = async (req, res) => {
  try {
    const foods = await Food.find();
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new food item
// @route   POST /foods
// @access  Admin
const addFood = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Food image is required" });
    }

    const food = await Food.create({
      name,
      price: Number(price),
      category,
      description: description || "",
      image: req.file.filename,
      inStock: true,
    });

    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a food item
// @route   PUT /foods/:id
// @access  Admin
const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, inStock } = req.body;

    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // Update details
    if (name) food.name = name;
    if (price) food.price = Number(price);
    if (category) food.category = category;
    if (description !== undefined) food.description = description;
    if (inStock !== undefined) food.inStock = inStock === "true" || inStock === true;

    // If new image is uploaded, replace the image filename
    if (req.file) {
      food.image = req.file.filename;
    }

    const updatedFood = await food.save();
    res.status(200).json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a food item
// @route   DELETE /foods/:id
// @access  Admin
const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFood = await Food.findByIdAndDelete(id);

    if (!deletedFood) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.status(200).json({ message: "Food item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle stock status
// @route   PUT /foods/:id/toggle-stock
// @access  Admin
const toggleStock = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findById(id);

    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    food.inStock = !food.inStock;
    const updatedFood = await food.save();
    res.status(200).json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFoods,
  addFood,
  updateFood,
  deleteFood,
  toggleStock,
};
