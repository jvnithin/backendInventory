import express from 'express';
import wholesalerController from '../controller/wholesalerController.js';
import verifyToken from "../middleware/verifyToken.js"
const router = express.Router();

router.get("/get-products/:id",verifyToken(["wholesaler","retailer"]),wholesalerController.getProducts);
router.get("/get-retailers",verifyToken(["wholesaler"]),wholesalerController.getRetailers);
router.put("/edit-retailer/:id",verifyToken(["wholesaler"]),wholesalerController.editRetailer);
router.get('/get-orders',verifyToken(["wholesaler"]), wholesalerController.getOrders);
router.put('/update-order-status/:id',verifyToken(["wholesaler"]), wholesalerController.updateOrderStatus);
router.put("/edit-wholesaler/",verifyToken(["wholesaler"]), wholesalerController.editWholesaler);
router.post("/add-payment",verifyToken(["wholesaler"]), wholesalerController.paymentUpdate);
// router.post("/add-subscription",verifyToken(["wholesaler"]), wholesalerController.addSubscription);
router.get("/get-transactions",verifyToken(["wholesaler"]), wholesalerController.getPayments);
export default router;