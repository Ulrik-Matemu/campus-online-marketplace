import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Product } from '../models/Product';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, category, price, condition } = req.body;

    // Multer attaches files to req.files
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Please upload at least one image." });
    }

    // Map Cloudinary response to our schema format
    const imageData = files.map((file: any) => ({
      url: file.path,
      public_id: file.filename
    }));

    const product = await Product.create({
      title,
      description,
      category,
      price,
      condition,
      images: imageData,
      owner: (req as any).user.id
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().populate('owner', 'name campus');
    res.status(200).json(products)
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check Ownership: Only owner or admin can edit
    if (product.owner.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return res.status(401).json({ message: "Not authorized to edit this listing" });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Product Update failed", error });
  }
};


export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check Ownership
    if (product.owner.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return res.status(401).json({ message: "Not authorized to delete this listing" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: "Product Deletion failed", error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id).populate('owner', 'name campus phoneNumber');
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
};

export const getListingsByOwner = async (req: Request, res: Response) => {
  try {
    // 1. Force treat the param as a string to satisfy the constructor
    const userIdString = req.params.userId as string;
    
    // 2. Use a plain object with 'any' or cast the ID to avoid the StrictCondition error
    const products = await Product.find({ 
      owner: new Types.ObjectId(userIdString) as any 
    });
    res.json({ products });
  } catch (error) {
    res.status(400).json({ message: "Invalid User ID format" });
  }
};