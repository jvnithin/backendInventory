import express from 'express'
const router = express.Router()
import retailerController from '../controller/retailerController.js';
import verifyToken from "../middleware/verifyToken.js";
router.get("/get-wholesalers",verifyToken(["retailer"]),retailerController.getWholesalers);
router.get("/get-products",verifyToken(["retailer"]),retailerController.getProducts);
router.post("/place-order",verifyToken(["retailer"]), retailerController.placeOrder);
router.post("/add-to-cart",verifyToken(["retailer"]), retailerController.addToCart);
router.get("/get-cart",verifyToken(["retailer"]), retailerController.getCart);
router.get('/get-orders',verifyToken(["retailer"]), retailerController.getOrders);
router.post("/subscribe-wholesaler",verifyToken(["retailer"]), retailerController.subscribeWholesaler);
router.delete('/delete-from-cart/:id',verifyToken(["retailer"]), retailerController.deleteFromCart);
router.put("/edit-retailer/",verifyToken(["retailer"]), retailerController.editRetailer);
router.put("/cancel-order/:id",verifyToken(["retailer"]), retailerController.cancelOrder);
router.get('/get-transactions',verifyToken(["retailer"]), retailerController.getPayments);
export default router;