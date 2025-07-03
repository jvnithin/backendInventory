import express from 'express';
import wholesalerController from '../controller/wholesalerController.js';
import verifyToken from "../middleware/verifyToken.js"
const router = express.Router();

router.get("/get-products",verifyToken(["wholesaler"]),wholesalerController.getProducts);

export default router;