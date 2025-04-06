import express from 'express';
import { createCombo, listCombos, updateCombo, deleteCombo, upload } from '../controllers/comboController.js';
import adminAuth from '../middleware/adminAuth.js';

const comboRouter = express.Router();

// Admin routes for combo management
comboRouter.post('/create', adminAuth, upload.single('coverImage'), createCombo);
comboRouter.get('/list', listCombos);
comboRouter.put('/update/:id', adminAuth, updateCombo);
comboRouter.delete('/delete/:id', adminAuth, deleteCombo);

export default comboRouter;