import express from 'express';
import { createService, getServices, updateService, deleteService, getServiceById, getListingsByProvider } from '../controllers/serviceController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public: Anyone can see available services
router.get('/', getServices);

// Protected: Only logged-in users can list a service
router.post('/', protect, createService);
router.put('/:id', protect, updateService); 
router.delete('/:id', protect, deleteService);
router.get('/:id', getServiceById);
router.get('/user/:userId', getListingsByProvider);

export default router;