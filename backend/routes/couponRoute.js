// backend/routes/couponRoute.js
import express from 'express';
import { addCoupon, listCoupons, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController.js';

const couponRouter = express.Router();

couponRouter.post('/add', addCoupon);
couponRouter.get('/list', listCoupons);
couponRouter.put('/:id', updateCoupon);
couponRouter.delete('/:id', deleteCoupon);
couponRouter.post('/validate', validateCoupon);

export default couponRouter;