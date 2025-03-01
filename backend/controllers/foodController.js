import fs from "fs";
import Food from "../models/foodModel.js";

// Add food item
const addFood = async (req, res) => {
  try {
    let image_filename = `${req.file.filename}`;

    const { name, description, price, category, ingredients, Advantages } = req.body;

    // Convert ingredients from string to array
    const ingredientsArray = ingredients.split(",").map((ingredient) => ingredient.trim());

    const food = new Food({
      name,
      description,
      price,
      category,
      image: image_filename,
      ingredients: ingredientsArray,
      Advantages,
    });

    await food.save();
    res.json({ success: true, message: "Food Added", data: food });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// List all food items
const listFood = async (req, res) => {
  try {
    const foods = await Food.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Remove food item
const removeFood = async (req, res) => {
  try {
    const food = await Food.findById(req.body.id);
    fs.unlink(`uploads/${food.image}`, () => {});

    await Food.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Get food item by ID
const getFoodById = async (req, res) => {
  try {
    const foodId = req.params.id;
    const food = await Food.findById(foodId);
    if (!food) {
      return res.json({ success: false, message: "Food item not found" });
    }
    res.json({ success: true, data: food });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { addFood, getFoodById, listFood, removeFood };
