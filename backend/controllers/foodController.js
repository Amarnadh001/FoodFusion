import fs from "fs";
import Food from "../models/foodModel.js";

// Add food item
const addFood = async (req, res) => {
  try {
    console.log("Adding food item with body:", req.body);
    console.log("File object:", req.file);
    
    // Extract and parse all fields
    const { 
      name, 
      description, 
      price, 
      category, 
      ingredients, 
      Advantages, 
      isVegetarian, 
      isSpicy, 
      preparationTime, 
      calories 
    } = req.body;

    // Debugging output
    console.log("Parsed form data:", {
      name,
      description,
      price: typeof price,
      category,
      ingredientsLength: ingredients ? ingredients.length : 0,
      isVegetarian,
      isSpicy
    });

    // Convert ingredients from string to array
    const ingredientsArray = ingredients ? ingredients.split(",").map((ingredient) => ingredient.trim()) : [];

    // Create the food object with all fields except imageUrl
    const foodData = {
      name,
      description,
      price: Number(price),
      category,
      ingredients: ingredientsArray,
      Advantages,
      isVegetarian: isVegetarian === "true" || isVegetarian === true,
      isSpicy: isSpicy === "true" || isSpicy === true,
      preparationTime: preparationTime ? Number(preparationTime) : undefined,
      calories: calories ? Number(calories) : undefined
    };
    
    // Check if file exists and add imageUrl only if it does
    if (req.file) {
      foodData.imageUrl = req.file.filename;
      console.log("Image uploaded successfully:", req.file.filename);
    } else {
      // Set a placeholder image name - the model requires imageUrl
      foodData.imageUrl = "placeholder.jpg";
      console.log("No image file uploaded, using placeholder image name");
    }

    console.log("Food object to save:", foodData);
    const food = new Food(foodData);
    const savedFood = await food.save();
    console.log("Food item saved successfully with ID:", savedFood._id);
    
    res.json({ 
      success: true, 
      message: "Food Added Successfully", 
      data: savedFood 
    });
  } catch (error) {
    console.log("Error adding food item:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error adding food item", 
      error: error.message 
    });
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
    fs.unlink(`uploads/${food.imageUrl}`, () => {});

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
