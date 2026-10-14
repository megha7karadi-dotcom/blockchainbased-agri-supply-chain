import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'farmer' | 'distributor' | 'retailer' | 'consumer' | 'admin';
  phone?: string;
  location?: string;
  organization?: string;
  primaryCrops?: string;
  certificationNumber?: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  trustScore: number;
  walletAddress?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['farmer', 'distributor', 'retailer', 'consumer', 'admin'],
    default: 'farmer' 
  },
  phone: { type: String, trim: true },
  location: { type: String, trim: true },
  organization: { type: String, trim: true },
  primaryCrops: { type: String, trim: true },
  certificationNumber: { type: String, trim: true },
  kycStatus: { type: String, enum: ['verified', 'pending', 'rejected'], default: 'verified' },
  trustScore: { type: Number, default: 98 },
  walletAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'users' });

export const User: mongoose.Model<IUser> = (mongoose.models.User as any) || mongoose.model<IUser>('User', UserSchema, 'users');
