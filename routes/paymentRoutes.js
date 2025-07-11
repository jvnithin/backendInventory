import express from 'express';
import paymentController from '../controller/paymentController.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.post('/create-order',paymentController.createOrder);
router.post("/verify-payment",verifyToken(["wholesaler"]),paymentController.verifyPaymentForSubscription);
router.post("/get-payment-details",paymentController.getPaymentDetails);


export default router;