import express from 'express';
import { createProduct } from '../controllers/productController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Only a logged-in student can hit this POST route
router.post('/', protect, createProduct);

export default router;