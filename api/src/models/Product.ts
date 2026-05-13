import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  // This links the product to the student's ID
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Product = model('Product', productSchema);