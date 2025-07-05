import express from 'express';
import authController from '../controller/authController.js';
const router = express.Router();


router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/get-user', authController.getUser);
export default router;