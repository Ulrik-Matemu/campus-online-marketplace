import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Add this inside your User.ts file before creating the model


export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  registrationNumber: string;
  phoneNumber: string; // Added for requirements
  campus: string;
  role: 'student' | 'admin'; // Strict typing for roles
  isVerified: boolean;
  verificationToken?: string;
  isModified(path: string): boolean;
}

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  campus: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  verificationToken: { type: String, required: false},
  isVerified: { type: Boolean, default: false }, // For admin approval flow
}, { timestamps: true });

// Password Hashing (Async/Promise version to avoid TS errors)
userSchema.pre<IUser>('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = model<IUser>('User', userSchema);