import express from "express";
import { addFood, listFood, removeFood, getFoodById, updateFood, toggleAvailability, toggleSpecial, toggleCombo } from "../controllers/foodController.js";
import multer from "multer";

const foodRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Routes
foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);
foodRouter.post("/update", upload.single("image"), updateFood);
foodRouter.post("/toggle-availability", toggleAvailability);
foodRouter.post("/toggle-special", toggleSpecial);
foodRouter.post("/toggle-combo", toggleCombo);
foodRouter.get("/:id", getFoodById);

export default foodRouter;