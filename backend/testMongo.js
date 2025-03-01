import mongoose from "mongoose";

const URI = "mongodb+srv://amarnadh:369082@cluster0.wbhb7.mongodb.net/food-fusion";

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
