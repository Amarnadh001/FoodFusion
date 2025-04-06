import Combo from '../models/comboModel.js';
import Food from '../models/foodModel.js';
import multer from 'multer';
import path from 'path';
import { validationResult } from 'express-validator';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Configure multer with file size limits and timeout
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
        }
    }
});

// Create a new combo
const createCombo = async (req, res) => {
    // Set a timeout for the request
    req.setTimeout(30000); // 30 seconds timeout
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, description, price } = req.body;
        let foodItems;
        try {
            if (!req.body.foodItems) {
                return res.status(400).json({
                    success: false,
                    message: 'foodItems is required'
                });
            }
            foodItems = JSON.parse(req.body.foodItems);
            if (!Array.isArray(foodItems)) {
                throw new Error('foodItems must be an array');
            }
            if (foodItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'foodItems array cannot be empty'
                });
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid foodItems format - must be a valid JSON array'
            });
        }

        // Handle cover image with validation
        let coverImage = null;
        if (req.file) {
            if (req.file.size > 5 * 1024 * 1024) {
                return res.status(400).json({
                    success: false,
                    message: 'Image size exceeds 5MB limit'
                });
            }
            coverImage = req.file.filename;
        }

        // Validate required fields
        if (!name || !description || !Array.isArray(foodItems) || foodItems.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields. A combo must have at least 2 items.'
            });
        }

        // Validate price
        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a valid number greater than 0'
            });
        }

        // Validate that all food items exist
        const existingFoodItems = await Food.find({ _id: { $in: foodItems } });
        if (existingFoodItems.length !== foodItems.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more food items do not exist'
            });
        }

        const combo = new Combo({
            name,
            description,
            foodItems,
            price,
            coverImage,
            imageUrl: coverImage ? `/uploads/${coverImage}` : null
        });

        // Set timeout for database operation
        const savePromise = combo.save();
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database operation timed out')), 20000);
        });

        await Promise.race([savePromise, timeoutPromise]);

        res.status(201).json({
            success: true,
            message: 'Combo created successfully',
            data: combo
        });
    } catch (error) {
        console.error('Error creating combo:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating combo'
        });
    }
};

// Get all combos
const listCombos = async (req, res) => {
    try {
        const combos = await Combo.find({ deletedAt: null, isAvailable: true })
            .populate({
                path: 'foodItems',
                select: 'name description price imageUrl'
            })
            .sort({ createdAt: -1 });

        // Process the combos to ensure proper image URLs
        const processedCombos = combos.map(combo => {
            const comboObj = combo.toObject();
            // Process cover image URL
            if (comboObj.coverImage) {
                comboObj.coverImage = comboObj.coverImage.includes('http') 
                    ? comboObj.coverImage 
                    : `${req.protocol}://${req.get('host')}/uploads/${comboObj.coverImage}`;
            }
            // Process food items image URLs
            comboObj.foodItems = comboObj.foodItems.map(item => ({
                ...item,
                imageUrl: item.imageUrl 
                    ? (item.imageUrl.includes('http') 
                        ? item.imageUrl 
                        : `${req.protocol}://${req.get('host')}/uploads/${item.imageUrl}`)
                    : null
            }));
            return comboObj;
        });

        res.json({
            success: true,
            data: processedCombos
        });
    } catch (error) {
        console.error('Error fetching combos:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching combos'
        });
    }
};

// Update combo
const updateCombo = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, foodItems, price, isAvailable } = req.body;

        if (foodItems && foodItems.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'A combo must have at least 2 items.'
            });
        }

        const combo = await Combo.findById(id);
        if (!combo) {
            return res.status(404).json({
                success: false,
                message: 'Combo not found'
            });
        }

        combo.name = name || combo.name;
        combo.description = description || combo.description;
        combo.foodItems = foodItems || combo.foodItems;
        combo.price = price || combo.price;
        combo.isAvailable = isAvailable !== undefined ? isAvailable : combo.isAvailable;

        // Set timeout for database operation
        const savePromise = combo.save();
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database operation timed out')), 20000);
        });

        await Promise.race([savePromise, timeoutPromise]);

        res.json({
            success: true,
            message: 'Combo updated successfully',
            data: combo
        });
    } catch (error) {
        console.error('Error updating combo:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating combo'
        });
    }
};

// Delete combo
const deleteCombo = async (req, res) => {
    try {
        const { id } = req.params;

        const combo = await Combo.findById(id);
        if (!combo) {
            return res.status(404).json({
                success: false,
                message: 'Combo not found'
            });
        }

        combo.deletedAt = new Date();
        // Set timeout for database operation
        const savePromise = combo.save();
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database operation timed out')), 20000);
        });

        await Promise.race([savePromise, timeoutPromise]);

        res.json({
            success: true,
            message: 'Combo deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting combo:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting combo'
        });
    }
};

export { createCombo, listCombos, updateCombo, deleteCombo };