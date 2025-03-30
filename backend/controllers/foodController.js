import fs from "fs";
import Food from "../models/foodModel.js";

// Toggle food item's special status
export const toggleSpecial = async (req, res) => {
  try {
    const { id, isSpecial } = req.body;
    const food = await Food.findByIdAndUpdate(
      id,
      { isSpecial },
      { new: true }
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found"
      });
    }

    res.json({
      success: true,
      message: "Special status updated successfully",
      data: food
    });
  } catch (error) {
    console.error("Error toggling special status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating special status"
    });
  }
};


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

// Update food item
const updateFood = async (req, res) => {
  try {
    console.log("Updating food item with body:", req.body);
    console.log("File object:", req.file);
    
    const { id, name, description, price, category, isAvailable } = req.body;
    
    // Find the food item
    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({ 
        success: false, 
        message: "Food item not found" 
      });
    }
    
    // Update basic fields
    food.name = name;
    food.description = description;
    food.price = Number(price);
    food.category = category;
    food.isAvailable = isAvailable === 'true' || isAvailable === true;
    
    // Update image if a new one was uploaded
    if (req.file) {
      // Delete old image if it exists and isn't a placeholder
      if (food.imageUrl && food.imageUrl !== 'placeholder.jpg') {
        try {
          fs.unlink(`uploads/${food.imageUrl}`, () => {
            console.log(`Deleted old image: ${food.imageUrl}`);
          });
        } catch (error) {
          console.log("Error deleting old image:", error);
        }
      }
      
      // Set new image
      food.imageUrl = req.file.filename;
      console.log("Updated image to:", req.file.filename);
    }
    
    // Save the updated food item
    const updatedFood = await food.save();
    console.log("Food item updated successfully with ID:", updatedFood._id);
    
    res.json({
      success: true,
      message: "Food item updated successfully",
      data: updatedFood
    });
    
  } catch (error) {
    console.log("Error updating food item:", error);
    res.status(500).json({
      success: false,
      message: "Error updating food item",
      error: error.message
    });
  }
};

// Toggle Today's Special status
const toggleSpecial = async (req, res) => {
  try {
    const { id, isSpecial } = req.body;
    
    // Find and update the food item
    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found"
      });
    }
    
    // Update special status
    food.isSpecial = isSpecial;
    await food.save();
    
    res.json({
      success: true,
      message: "Food special status updated successfully",
      data: food
    });
  } catch (error) {
    console.log("Error updating food special status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating food special status",
      error: error.message
    });
  }
};

// Toggle food item availability
const toggleAvailability = async (req, res) => {
  try {
    const { id, isAvailable } = req.body;
    
    // Find and update the food item
    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found"
      });
    }
    
    // Update availability
    food.isAvailable = isAvailable;
    await food.save();
    
    res.json({
      success: true,
      message: `Food item is now ${isAvailable ? 'available' : 'unavailable'}`,
      data: food
    });
    
  } catch (error) {
    console.log("Error toggling availability:", error);
    res.status(500).json({
      success: false,
      message: "Error updating availability",
      error: error.message
    });
  }
};

export { addFood, getFoodById, listFood, removeFood, updateFood, toggleAvailability, toggleSpecial };
