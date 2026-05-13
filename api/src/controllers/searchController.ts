import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Service } from '../models/Service';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { keyword, category, type, minPrice, maxPrice } = req.query;

    // Build the query object
    let query: any = {};
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = { 
        ...(minPrice && { $gte: Number(minPrice) }), 
        ...(maxPrice && { $lte: Number(maxPrice) }) 
      };
    }

    let results = [];

    if (type === 'product') {
      results = await Product.find(query).populate('owner', 'name campus');
    } else if (type === 'service') {
      // Services use 'rate' instead of 'price', so we adjust the query
      if (query.price) {
        query.rate = query.price;
        delete query.price;
      }
      results = await Service.find(query).populate('provider', 'name campus');
    } else {
      // If no type specified, fetch both (common for a 'Search All' bar)
      const products = await Product.find(query).limit(10);
      const services = await Service.find(query).limit(10);
      results = [...products, ...services];
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Search failed", error });
  }
};