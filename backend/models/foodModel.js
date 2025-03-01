import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  ingredients: { type: [String], required: true }, // Array of ingredients
  Advantages: { type: String, required: true }, // Advantages as a string
});

export default mongoose.model("Food", foodSchema);