import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  batchId: string;
  cropName: string;
  cropVariety?: string;
  quantity: number;
  unit: string;
  farmName?: string;
  farmLocation: string;
  district?: string;
  state: string;
  pinCode?: string;
  harvestDate: string;
  qualityGrade: string;
  certification?: string;
  notes?: string;
  farmgatePrice: number;
  priceUnit: string;
  farmerId: string;
  farmerName: string;
  status: string;
  pricing: {
    farmerPrice: number;
    distributorLogisticsCost: number;
    distributorMargin: number;
    retailerOverhead: number;
    retailerMargin: number;
    finalConsumerPrice: number;
    currency: string;
    fairPriceCeiling: number;
  };
  quality: {
    grade: string;
    freshnessScore: number;
    moistureContent?: string;
    pesticideResidueTest?: string;
    organicCertificationNumber?: string;
    certifyingBody?: string;
    harvestDate: string;
    shelfLifeDays: number;
  };
  blockchain: {
    contractAddress?: string;
    tokenId?: string;
    blockNumber?: number;
    mintTxHash?: string;
    currentOwnerWallet?: string;
    consensusMechanism?: string;
    gasUsed?: string;
    merkleRootHash?: string;
    isTamperEvident?: boolean;
    statusNotice?: string;
  };
  timeline: Array<{
    id: string;
    stage: string;
    title: string;
    description: string;
    actorName: string;
    actorRole: string;
    location: string;
    timestamp: string;
    temperature?: string;
    humidity?: string;
    verified?: boolean;
  }>;
  sensorLogs: Array<{
    timestamp: string;
    temperature: number;
    humidity: number;
    location: string;
    status: string;
  }>;
  imageUrl?: string;
  description?: string;
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  batchId: { type: String, required: true, unique: true, index: true, trim: true },
  cropName: { type: String, required: true, trim: true },
  cropVariety: { type: String, trim: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true, default: 'kg' },
  farmName: { type: String, trim: true },
  farmLocation: { type: String, required: true, trim: true },
  district: { type: String, trim: true },
  state: { type: String, required: true, trim: true },
  pinCode: { type: String, trim: true },
  harvestDate: { type: String, required: true },
  qualityGrade: { type: String, required: true, default: 'Grade A' },
  certification: { type: String, trim: true },
  notes: { type: String, trim: true },
  farmgatePrice: { type: Number, required: true },
  priceUnit: { type: String, default: '₹ / kg' },
  farmerId: { type: String, required: true },
  farmerName: { type: String, required: true },
  status: { type: String, default: 'Registered' },
  pricing: {
    farmerPrice: { type: Number, default: 0 },
    distributorLogisticsCost: { type: Number, default: 0 },
    distributorMargin: { type: Number, default: 0 },
    retailerOverhead: { type: Number, default: 0 },
    retailerMargin: { type: Number, default: 0 },
    finalConsumerPrice: { type: Number, default: 0 },
    currency: { type: String, default: '₹' },
    fairPriceCeiling: { type: Number, default: 0 }
  },
  quality: {
    grade: { type: String, default: 'Grade A' },
    freshnessScore: { type: Number, default: 100 },
    moistureContent: { type: String, default: '80%' },
    pesticideResidueTest: { type: String, default: 'Within Safe Limits' },
    organicCertificationNumber: { type: String },
    certifyingBody: { type: String },
    harvestDate: { type: String },
    shelfLifeDays: { type: Number, default: 14 }
  },
  blockchain: {
    contractAddress: { type: String, default: '0x3A5b8214Fa9E18aB9B625697d022bfe5716E5D3c' },
    tokenId: { type: String },
    blockNumber: { type: Number },
    mintTxHash: { type: String },
    currentOwnerWallet: { type: String },
    consensusMechanism: { type: String, default: 'Ethereum Sepolia Ledger' },
    gasUsed: { type: String, default: '74,200 Gwei' },
    merkleRootHash: { type: String },
    isTamperEvident: { type: Boolean, default: true },
    statusNotice: { type: String, default: 'Registered Producer Ledger Entry' }
  },
  timeline: [{
    id: { type: String },
    stage: { type: String },
    title: { type: String },
    description: { type: String },
    actorName: { type: String },
    actorRole: { type: String },
    location: { type: String },
    timestamp: { type: String },
    temperature: { type: String },
    humidity: { type: String },
    verified: { type: Boolean, default: true }
  }],
  sensorLogs: [{
    timestamp: { type: String },
    temperature: { type: Number },
    humidity: { type: Number },
    location: { type: String },
    status: { type: String, default: 'optimal' }
  }],
  imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80' },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'products' });

export const Product: mongoose.Model<IProduct> = (mongoose.models.Product as any) || mongoose.model<IProduct>('Product', ProductSchema, 'products');
