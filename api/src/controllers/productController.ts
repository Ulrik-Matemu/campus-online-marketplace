import { Request, Response } from 'express';
import { Product } from '../models/Product';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, price } = req.body;
    
    // req.user.id comes from the decoded JWT in the middleware
    const product = await Product.create({
      title,
      description,
      price,
      owner: (req as any).user.id 
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};