import express from 'express';
import adminController from '../controller/adminController.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.get('/get-wholesalers',verifyToken(["admin"]),adminController.getWholesalers);
router.get('/get-retailers/:id',verifyToken(["admin"]),adminController.getRetailers);
router.delete('/deactivate-wholesaler/:id',verifyToken(["admin"]),adminController.deactivateWholesaler);
export default router;