import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the interface for the document
interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  registrationNumber: string;
  campus: string;
  role: string;
  isModified(path: string): boolean;
}

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  campus: { type: String, required: true },
  role: { type: String, default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

// Use async function without the 'next' parameter
userSchema.pre<IUser>('save', async function () {
  // If the password isn't modified, just return (same as calling next)
  if (!this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    // Re-throw the error to let Mongoose catch it
    throw error;
  }
});

export const User = model<IUser>('User', userSchema);