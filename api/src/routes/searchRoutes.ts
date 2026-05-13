import express from 'express';
import { globalSearch } from '../controllers/searchController';

const router = express.Router();
router.get('/', globalSearch); // GET /api/v1/search?keyword=laptop&minPrice=100000
export default router;