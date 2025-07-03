import express from 'express'
import productController from '../controller/productController.js';
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router()


router.get('/getById/:id',productController.getById)
router.post("/new",verifyToken(["wholesaler"]), productController.createProduct);
router.put("/update/:id",verifyToken(["wholesaler"]), productController.updateProduct);
router.delete("/delete/:id",verifyToken(["wholesaler"]), productController.deleteProduct);

export default router;