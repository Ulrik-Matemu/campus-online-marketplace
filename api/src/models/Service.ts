import { Schema, model, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  description: string;
  category: string;
  rate: number; // e.g., 5000 TZS per hour or per task
  rateType: 'hourly' | 'fixed'; 
  provider: Schema.Types.ObjectId;
  createdAt: Date;
}

const serviceSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // e.g., "Graphic Design", "Laundry"
  rate: { type: Number, required: true },
  rateType: { 
    type: String, 
    enum: ['hourly', 'fixed'], 
    default: 'fixed' 
  },
  provider: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Service = model<IService>('Service', serviceSchema);