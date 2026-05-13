import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  condition: 'New' | 'Used - Like New' | 'Used - Good' | 'Used - Fair';
  images: { url: string; public_id: string }[];
  owner: Schema.Types.ObjectId;
}

const productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // e.g., "Electronics", "Books"
  price: { type: Number, required: true },
  condition: { 
    type: String, 
    enum: ['New', 'Used - Like New', 'Used - Good', 'Used - Fair'], 
    required: true 
  },
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true }
    }
  ],
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Product = model<IProduct>('Product', productSchema);