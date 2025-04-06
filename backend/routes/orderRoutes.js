import express from 'express';
import { placeOrder, userOrders, trackOrder } from '../controllers/orderController.js';

const router = express.Router();

router.post('/place', placeOrder);
router.post('/userorders', userOrders);
router.get('/track/:orderId', trackOrder);

export default router; 