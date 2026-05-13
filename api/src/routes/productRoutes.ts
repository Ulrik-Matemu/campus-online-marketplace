import express from 'express';
import { createProduct, getProducts, updateProduct, deleteProduct, getProductById, getListingsByOwner } from '../controllers/productController';
import { protect } from '../middleware/auth';
import { upload } from '../config/cloudinary';

const router = express.Router();

// protect: check JWT
// upload.array: handle up to 5 images
router.post('/', protect, upload.array('images', 5), createProduct);
router.get('/', getProducts);
router.put('/:id', protect, updateProduct); 
router.delete('/:id', protect, deleteProduct);
router.get('/:id', getProductById);
router.get('/user/:userId', getListingsByOwner);

export default router;