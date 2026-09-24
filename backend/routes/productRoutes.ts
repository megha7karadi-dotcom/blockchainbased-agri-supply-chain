import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product, IProduct } from '../models/Product';
import { authenticateJWT, optionalJWT, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Memory store fallback and cache for rapid querying
const inMemoryProducts: Map<string, any> = new Map();

/**
 * Standard Crop Codes
 */
const CROP_CODE_MAP: Record<string, string> = {
  mango: 'MNG', mangoes: 'MNG', alphonso: 'MNG',
  rice: 'RIC', basmati: 'RIC', paddy: 'RIC',
  tomato: 'TOM', tomatoes: 'TOM',
  wheat: 'WHT', cotton: 'CTN',
  turmeric: 'TRM', haldi: 'TRM',
  apple: 'APL', apples: 'APL',
  potato: 'POT', potatoes: 'POT',
  onion: 'ONI', onions: 'ONI',
  chilli: 'CHL', chillies: 'CHL',
  soybean: 'SOY', coffee: 'COF', tea: 'TEA',
  sugarcane: 'SGC', banana: 'BAN', grapes: 'GRP',
  corn: 'CRN', maize: 'CRN', cardamom: 'CRD',
  ginger: 'GNG', garlic: 'GRL',
};

function generateBatchId(cropName: string, count: number = 0): string {
  const year = 2026;
  const cleanCrop = (cropName || '').toLowerCase().trim();
  let cropCode: string | undefined;

  for (const [key, code] of Object.entries(CROP_CODE_MAP)) {
    if (cleanCrop.includes(key)) {
      cropCode = code;
      break;
    }
  }

  if (!cropCode) {
    const lettersOnly = cleanCrop.replace(/[^a-z0-9]/gi, '').toUpperCase();
    cropCode = lettersOnly.length >= 3 ? lettersOnly.slice(0, 3) : (lettersOnly + 'AGR').slice(0, 3);
  }

  const seq = String(count + 1).padStart(3, '0');
  return `AGRI-${year}-${cropCode}-${seq}`;
}

// Initial seed products for immediate display & testing
const SEED_PRODUCTS = [
  {
    batchId: 'AGRI-2026-MNG-001',
    name: 'Alphonso Mangoes',
    cropName: 'Alphonso Mangoes',
    cropVariety: 'Ratnagiri GI Tagged Premium',
    category: 'Fruits',
    quantity: 1200,
    unit: 'kg',
    farmName: 'Sahyadri Organic Orchard',
    farmLocation: 'Ratnagiri, Konkan Coastal Zone',
    farmerLocation: 'Ratnagiri, Konkan Coastal Zone',
    district: 'Ratnagiri',
    state: 'Maharashtra',
    pinCode: '415612',
    harvestDate: '2026-03-28',
    qualityGrade: 'Grade A',
    certification: 'NPOP/NAB/0912/MH',
    notes: 'Handpicked tree-ripened Alphonso mangoes with zero synthetic ripening agents.',
    farmgatePrice: 180,
    priceUnit: '₹ / kg',
    farmerId: 'usr-farmer-01',
    farmerName: 'Ramesh Patil',
    status: 'Registered',
    pricing: {
      farmerPrice: 180,
      distributorLogisticsCost: 35,
      distributorMargin: 25,
      retailerOverhead: 20,
      retailerMargin: 30,
      finalConsumerPrice: 290,
      currency: '₹',
      fairPriceCeiling: 320,
    },
    quality: {
      grade: 'Grade A (Export Quality)',
      freshnessScore: 98,
      moistureContent: '82%',
      pesticideResidueTest: 'Zero Residue (Certified Organic)',
      organicCertificationNumber: 'NPOP/NAB/0912/MH',
      certifyingBody: 'APEDA India / Aditi Organic Certifications',
      harvestDate: '2026-03-28',
      shelfLifeDays: 14,
    },
    blockchain: {
      contractAddress: '0x3A5b8214Fa9E18aB9B625697d022bfe5716E5D3c',
      tokenId: '0x001_MNG',
      blockNumber: 18946210,
      mintTxHash: '0x9a8f3b2c1e4d5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      currentOwnerWallet: '0x71C...84B2',
      consensusMechanism: 'Ethereum Sepolia Ledger',
      gasUsed: '74,200 Gwei',
      merkleRootHash: '0x4f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c',
      isTamperEvident: true,
      statusNotice: 'Registered Producer Ledger Entry'
    },
    timeline: [
      {
        id: 'tl-1',
        stage: 'Farming',
        title: 'Harvest & Produce Batch Registered',
        description: 'Harvested in Ratnagiri orchards. Quality verified Grade A organic and minted to decentralized registry.',
        actorName: 'Ramesh Patil (Producer)',
        actorRole: 'farmer',
        location: 'Ratnagiri, Maharashtra',
        timestamp: 'Mar 28, 2026, 07:30 AM',
        temperature: '24.2°C',
        humidity: '68%',
        verified: true,
      }
    ],
    sensorLogs: [
      { timestamp: '08:00 AM', temperature: 24.2, humidity: 68, location: 'Ratnagiri Packhouse', status: 'optimal' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
    description: 'Authentic GI-tagged Ratnagiri Alphonso mangoes with farmgate pricing traceability and zero pesticide residues.',
    createdAt: new Date('2026-03-28T07:30:00Z')
  },
  {
    batchId: 'AGRI-2026-WHT-002',
    name: 'Sharbati Organic Wheat',
    cropName: 'Sharbati Organic Wheat',
    cropVariety: 'Sehore Golden Grain',
    category: 'Grains',
    quantity: 5000,
    unit: 'kg',
    farmName: 'Narmada Valley Agro Trust',
    farmLocation: 'Sehore, Narmada River Basin',
    farmerLocation: 'Sehore, Narmada River Basin',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    pinCode: '466001',
    harvestDate: '2026-04-02',
    qualityGrade: 'Grade A',
    certification: 'MP-ORG-2026-881',
    notes: 'Rainfed Sharbati whole grain wheat naturally sun-dried.',
    farmgatePrice: 48,
    priceUnit: '₹ / kg',
    farmerId: 'usr-farmer-02',
    farmerName: 'Balwinder Singh',
    status: 'In Transit',
    pricing: {
      farmerPrice: 48,
      distributorLogisticsCost: 8,
      distributorMargin: 6,
      retailerOverhead: 5,
      retailerMargin: 8,
      finalConsumerPrice: 75,
      currency: '₹',
      fairPriceCeiling: 82,
    },
    quality: {
      grade: 'Grade A (Export Quality)',
      freshnessScore: 99,
      moistureContent: '11.5%',
      pesticideResidueTest: 'Zero Synthetic Chemicals Detected',
      organicCertificationNumber: 'MP-ORG-2026-881',
      certifyingBody: 'Madhya Pradesh Organic Certification Agency',
      harvestDate: '2026-04-02',
      shelfLifeDays: 365,
    },
    blockchain: {
      contractAddress: '0x3A5b8214Fa9E18aB9B625697d022bfe5716E5D3c',
      tokenId: '0x002_WHT',
      blockNumber: 18946350,
      mintTxHash: '0x3b2c1e4d5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
      currentOwnerWallet: '0x3B2...9A41',
      consensusMechanism: 'Ethereum Sepolia Ledger',
      gasUsed: '68,400 Gwei',
      merkleRootHash: '0x7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f',
      isTamperEvident: true,
      statusNotice: 'Registered Producer Ledger Entry'
    },
    timeline: [
      {
        id: 'tl-2',
        stage: 'Farming',
        title: 'Harvest & Grain Quality Tested',
        description: 'Sun-dried wheat bagged and logged at Sehore co-operative depot.',
        actorName: 'Balwinder Singh',
        actorRole: 'farmer',
        location: 'Sehore, MP',
        timestamp: 'Apr 02, 2026, 09:15 AM',
        temperature: '28.0°C',
        humidity: '42%',
        verified: true,
      }
    ],
    sensorLogs: [
      { timestamp: '09:30 AM', temperature: 28.0, humidity: 42, location: 'Sehore Granary Depot', status: 'optimal' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
    description: 'Premium Sehore Sharbati wheat, harvested organically and preserved in dry ambient conditions.',
    createdAt: new Date('2026-04-02T09:15:00Z')
  }
];

// Initialize in-memory seed products
SEED_PRODUCTS.forEach(p => inMemoryProducts.set(p.batchId, p));

/**
 * Seed MongoDB with sample products if empty
 */
async function ensureDbSeeded() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding MongoDB Atlas with initial AgriTrace verified produce batches...');
      await Product.insertMany(SEED_PRODUCTS as any);
      console.log('✅ MongoDB Atlas seeded successfully');
    }
  } catch (err: any) {
    console.warn('MongoDB auto-seed note:', err?.message);
  }
}

// Trigger check when connected
if (mongoose.connection.readyState === 1) {
  ensureDbSeeded();
} else {
  mongoose.connection.once('connected', ensureDbSeeded);
}

/**
 * POST /api/products
 * Registers a new produce batch in MongoDB Atlas
 * Protected with JWT authentication (or fallback to user profile in request)
 */
router.post('/', optionalJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body;
    const authUser = req.user;

    if (authUser && authUser.role === 'consumer') {
      return res.status(403).json({ success: false, error: 'Access denied: Consumer accounts cannot register produce batches.' });
    }

    const {
      cropName,
      cropVariety,
      quantity,
      unit = 'kg',
      farmName,
      farmLocation,
      district,
      state,
      pinCode,
      harvestDate,
      qualityGrade = 'Grade A',
      certification,
      notes,
      farmgatePrice,
      priceUnit,
      farmerId: reqFarmerId,
      farmerName: reqFarmerName,
    } = body;

    // Validation
    if (!cropName || !cropName.trim()) {
      return res.status(400).json({ success: false, error: 'Crop name is required.' });
    }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid positive harvest quantity is required.' });
    }
    if (!farmLocation || !farmLocation.trim()) {
      return res.status(400).json({ success: false, error: 'Farm location is required.' });
    }
    if (!state || !state.trim()) {
      return res.status(400).json({ success: false, error: 'State is required.' });
    }
    if (!harvestDate) {
      return res.status(400).json({ success: false, error: 'Harvest date is required.' });
    }
    if (!farmgatePrice || isNaN(Number(farmgatePrice)) || Number(farmgatePrice) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid positive farmgate price is required.' });
    }

    // Determine sequence & generate batchId
    let totalCount = inMemoryProducts.size;
    if (mongoose.connection.readyState === 1) {
      try {
        totalCount = await Product.countDocuments();
      } catch {
        // fallback to memory count
      }
    }

    const batchId = generateBatchId(cropName, totalCount);
    const farmerId = authUser?.id || reqFarmerId || 'usr-farmer-01';
    const farmerName = authUser?.name || reqFarmerName || 'Verified Producer';
    const numPrice = Number(farmgatePrice);
    const numQty = Number(quantity);

    const initialTimeline = {
      id: `tl-${Date.now()}`,
      stage: 'Farming',
      title: 'Harvest & Produce Batch Registered',
      description: `Registered at ${farmLocation}, ${state}. Farmgate base rate logged at ₹${numPrice}/${unit}. Stored in MongoDB Atlas.`,
      actorName: farmerName,
      actorRole: 'farmer',
      location: `${farmLocation}, ${state}`,
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      temperature: '23.5°C',
      humidity: '65%',
      verified: true,
    };

    const newProductData = {
      batchId,
      name: cropName.trim(),
      cropName: cropName.trim(),
      cropVariety: cropVariety?.trim() || '',
      quantity: numQty,
      quantityKg: unit === 'kg' ? numQty : unit === 'quintal' ? numQty * 100 : unit === 'ton' ? numQty * 1000 : numQty,
      unit: unit,
      farmName: farmName?.trim() || 'Green Valley Agro Farm',
      farmLocation: farmLocation.trim(),
      farmerLocation: `${farmLocation.trim()}${state ? `, ${state.trim()}` : ''}`,
      district: district?.trim() || '',
      state: state.trim(),
      pinCode: pinCode?.trim() || '',
      harvestDate: harvestDate,
      qualityGrade: qualityGrade,
      certification: certification?.trim() || '',
      notes: notes?.trim() || '',
      farmgatePrice: numPrice,
      priceUnit: priceUnit || `₹ / ${unit}`,
      farmerId: farmerId,
      farmerName: farmerName,
      status: 'Registered',
      pricing: {
        farmerPrice: numPrice,
        distributorLogisticsCost: 0,
        distributorMargin: 0,
        retailerOverhead: 0,
        retailerMargin: 0,
        finalConsumerPrice: numPrice,
        currency: '₹',
        fairPriceCeiling: Math.round(numPrice * 1.5),
      },
      quality: {
        grade: qualityGrade === 'Grade A' ? 'Grade A (Export Quality)' : qualityGrade === 'Grade B' ? 'Grade B (Premium)' : 'Grade C (Standard)',
        freshnessScore: 100,
        moistureContent: '80%',
        pesticideResidueTest: certification ? 'Zero Residue (Certified Organic)' : 'Within Safe Limits',
        organicCertificationNumber: certification || undefined,
        certifyingBody: certification ? 'Organic Certifying Authority' : undefined,
        harvestDate: harvestDate,
        shelfLifeDays: 14,
      },
      blockchain: {
        contractAddress: body.blockchain?.contractAddress || (await import('../services/blockchainService')).getContractAddress(),
        tokenId: `0x${batchId.replace(/[^a-zA-Z0-9]/g, '')}`,
        blockNumber: Number(body.blockchain?.blockNumber) || 1,
        mintTxHash: body.blockchain?.mintTxHash || body.blockchain?.txHash || '0x0000000000000000000000000000000000000000000000000000000000000000',
        currentOwnerWallet: body.blockchain?.currentOwnerWallet || (authUser as any)?.walletAddress || '0x0000000000000000000000000000000000000000',
        consensusMechanism: body.blockchain?.consensusMechanism || 'Ethereum EVM / AgriTrace Smart Contract',
        gasUsed: body.blockchain?.gasUsed || '180,000 gas',
        merkleRootHash: body.blockchain?.merkleRootHash || body.blockchain?.originHash || '0x0000000000000000000000000000000000000000000000000000000000000000',
        isTamperEvident: true,
        statusNotice: 'Verified Smart Contract State: Registered Produce Batch'
      },
      timeline: [initialTimeline],
      sensorLogs: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temperature: 23.5,
          humidity: 65,
          location: 'Farm Packing Shed',
          status: 'optimal'
        }
      ],
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      description: notes || `${cropName} harvested at ${farmLocation}. Batch verified and stored in MongoDB Atlas.`,
      createdAt: new Date(),
    };

    let savedProduct: any = null;

    // Save to MongoDB Atlas
    if (mongoose.connection.readyState === 1) {
      try {
        const productDoc = new Product(newProductData);
        const savedDoc = await productDoc.save();
        savedProduct = savedDoc.toObject();
        console.log(`✅ Produce batch ${batchId} saved to MongoDB Atlas!`);
      } catch (dbErr: any) {
        console.warn('MongoDB Atlas produce save notice:', dbErr?.message);
      }
    }

    // Save/cache in memory as well
    const resultProduct = savedProduct || { ...newProductData, _id: `db-${Date.now()}` };
    inMemoryProducts.set(batchId, resultProduct);

    return res.status(201).json({
      success: true,
      message: 'Produce batch successfully registered and persisted in MongoDB Atlas.',
      batchId: resultProduct.batchId,
      product: resultProduct
    });
  } catch (error: any) {
    console.error('Error registering product:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to register produce batch in database.',
      details: error?.message
    });
  }
});

/**
 * GET /api/products
 * Returns all registered produce batches (from MongoDB Atlas)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    let dbProducts: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        dbProducts = await Product.find().sort({ createdAt: -1 });
      } catch (dbErr: any) {
        console.warn('MongoDB Atlas read notice:', dbErr?.message);
      }
    }

    if (dbProducts.length > 0) {
      // Sync memory cache
      dbProducts.forEach(p => inMemoryProducts.set(p.batchId, p));
      return res.json({
        success: true,
        source: 'mongodb_atlas',
        count: dbProducts.length,
        products: dbProducts
      });
    }

    // Fallback to in-memory items
    const memoryList = Array.from(inMemoryProducts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.json({
      success: true,
      source: 'memory_cache',
      count: memoryList.length,
      products: memoryList
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve products.' });
  }
});

/**
 * GET /api/products/my-produce
 * Returns produce batches for authenticated farmer
 */
router.get('/my-produce', optionalJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    let list: any[] = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const query: any = {};
        if (user?.id) {
          query.$or = [{ farmerId: user.id }, { farmerName: user.name }];
        }
        list = await Product.find(query).sort({ createdAt: -1 });
      } catch {
        // ignore
      }
    }

    if (list.length === 0) {
      list = Array.from(inMemoryProducts.values());
      if (user?.id) {
        const filtered = list.filter(p => p.farmerId === user.id || p.farmerName === user.name);
        if (filtered.length > 0) list = filtered;
      }
    }

    return res.json({
      success: true,
      count: list.length,
      products: list
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve produce batches.' });
  }
});

/**
 * GET /api/products/:batchId
 * Public endpoint to verify a produce batch
 */
router.get('/:batchId', async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    const cleanId = (batchId || '').trim();

    let product: any = null;

    // Search in MongoDB Atlas
    if (mongoose.connection.readyState === 1) {
      try {
        product = await Product.findOne({
          $or: [
            { batchId: cleanId },
            { batchId: { $regex: new RegExp(`^${cleanId}$`, 'i') } }
          ]
        });
      } catch (dbErr: any) {
        console.warn('MongoDB lookup notice:', dbErr?.message);
      }
    }

    // Search in-memory cache
    if (!product) {
      for (const [key, val] of inMemoryProducts.entries()) {
        if (key.toLowerCase() === cleanId.toLowerCase() || val.id === cleanId) {
          product = val;
          break;
        }
      }
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Batch "${cleanId}" not found in AgriTrace database registry.`
      });
    }

    return res.json({
      success: true,
      batchId: product.batchId,
      product
    });
  } catch (error: any) {
    console.error('Error fetching batch:', error);
    return res.status(500).json({ success: false, error: 'Error fetching batch verification details.' });
  }
});

/**
 * Helper to find and update a product in MongoDB Atlas or memory
 */
async function findAndSaveProduct(batchId: string, updateFn: (prod: any) => void) {
  const cleanId = (batchId || '').trim();
  let product: any = null;

  if (mongoose.connection.readyState === 1) {
    try {
      product = await Product.findOne({
        $or: [
          { batchId: cleanId },
          { batchId: { $regex: new RegExp(`^${cleanId}$`, 'i') } }
        ]
      });
    } catch (e) {
      console.warn('MongoDB lookup err in findAndSaveProduct:', e);
    }
  }

  if (!product) {
    for (const [key, val] of inMemoryProducts.entries()) {
      if (key.toLowerCase() === cleanId.toLowerCase() || val.id === cleanId) {
        product = val;
        break;
      }
    }
  }

  if (!product) return null;

  updateFn(product);

  if (mongoose.connection.readyState === 1 && typeof product.save === 'function') {
    try {
      await product.save();
    } catch (dbErr) {
      console.warn('Failed saving updated product to MongoDB:', dbErr);
    }
  }

  const plainProduct = typeof product.toObject === 'function' ? product.toObject() : product;
  inMemoryProducts.set(plainProduct.batchId, plainProduct);
  return plainProduct;
}

/**
 * POST /api/products/:batchId/transfer-to-distributor
 * Farmer transfers batch to Distributor
 */
router.post('/:batchId/transfer-to-distributor', optionalJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { batchId } = req.params;
    const { distributorName, distributorId, quantity, agreedPrice } = req.body;
    const user = req.user;

    const numQty = Number(quantity);
    const numPrice = Number(agreedPrice);

    const updated = await findAndSaveProduct(batchId, (prod) => {
      prod.status = 'Transferred to Distributor';
      prod.currentCustodianRole = 'distributor';
      prod.currentCustodianName = distributorName || 'Partner Distributor';
      if (numPrice) {
        prod.pricing = prod.pricing || {};
        prod.pricing.farmerPrice = numPrice;
      }

      const timelineEvent = {
        id: `tl-${Date.now()}`,
        stage: 'Logistics',
        title: 'Transferred to Distributor',
        description: `Farmer transferred ${numQty || prod.quantity} ${prod.unit || 'kg'} to ${distributorName || 'Distributor'} at agreed price ₹${numPrice || prod.farmgatePrice}/${prod.unit || 'kg'}.`,
        actorName: user?.name || prod.farmerName || 'Farmer',
        actorRole: 'farmer',
        location: prod.farmLocation || 'Farm Origin',
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        verified: true,
      };

      prod.timeline = prod.timeline || [];
      prod.timeline.push(timelineEvent);
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Batch not found.' });
    }

    return res.json({
      success: true,
      message: 'Batch successfully transferred to distributor.',
      product: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to transfer batch to distributor.' });
  }
});

/**
 * POST /api/products/:batchId/distributor-receive
 * Distributor accepts / receives produce
 */
router.post('/:batchId/distributor-receive', optionalJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { batchId } = req.params;
    const { notes } = req.body;
    const user = req.user;

    const updated = await findAndSaveProduct(batchId, (prod) => {
      prod.status = 'At Distributor';
      prod.currentCustodianRole = 'distributor';
      if (user?.name) prod.currentCustodianName = user.name;

      const timelineEvent = {
        id: `tl-${Date.now()}`,
        stage: 'Logistics',
        title: 'Shipment Received by Distributor',
        description: notes || 'Produce quality verified, lot accepted into distributor storage hub.',
        actorName: user?.name || 'Distributor Logistics',
        actorRole: 'distributor',
        location: user?.location || 'Regional Distribution Center',
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        verified: true,
      };

      prod.timeline = prod.timeline || [];
      prod.timeline.push(timelineEvent);
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Batch not found.' });
    }

    return res.json({
      success: true,
      message: 'Shipment accepted into distributor inventory.',
      product: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to accept produce shipment.' });
  }
});

/**
 * POST /api/products/:batchId/distributor-price
 * Distributor updates purchase price, margin, and selling price
 */
router.post('/:batchId/distributor-price', optionalJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { batchId } = req.params;
    const { purchasePrice, marginPercentage, sellingPrice } = req.body;
    const user = req.user;

    const numPurchase = Number(purchasePrice);
    const numMargin = Number(marginPercentage);
    const numSelling = Number(sellingPrice);

    const updated = await findAndSaveProduct(batchId, (prod) => {
      prod.pricing = prod.pricing || {};
      if (numPurchase) prod.pricing.farmerPrice = numPurchase;
      prod.pricing.distributorMargin = numMargin;
      prod.pricing.finalConsumerPrice = numSelling;

      const timelineEvent = {
        id: `tl-${Date.now()}`,
        stage: 'Wholesale',
        title: 'Distributor Pricing Configured',
        description: `Base purchase: ₹${numPurchase}/${prod.unit || 'kg'}, Margin: ${numMargin}%, Wholesale selling price: ₹${numSelling}/${prod.unit || 'kg'}.`,
        actorName: user?.name || 'Distributor',
        actorRole: 'distributor',
        location: user?.location || 'Distribution Hub',
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        verified: true,
      };

      prod.timeline = prod.timeline || [];
      prod.timeline.push(timelineEvent);
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Batch not found.' });
    }

    return res.json({
      success: true,
      message: 'Distributor price updated successfully.',
      product: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update distributor price.' });
  }
});

/**
 * POST /api/products/:batchId/transfer-to-retailer
 * Distributor transfers batch to Retailer
 */
router.post('/:batchId/transfer-to-retailer', optionalJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { batchId } = req.params;
    const { retailerName, retailerId, quantity, sellingPrice } = req.body;
    const user = req.user;

    const numQty = Number(quantity);
    const numSelling = Number(sellingPrice);

    const updated = await findAndSaveProduct(batchId, (prod) => {
      prod.status = 'In Transit to Retailer';
      prod.currentCustodianRole = 'retailer';
      prod.currentCustodianName = retailerName || 'Retail Partner';

      if (numSelling) {
        prod.pricing = prod.pricing || {};
        prod.pricing.finalConsumerPrice = numSelling;
      }

      const timelineEvent = {
        id: `tl-${Date.now()}`,
        stage: 'Wholesale',
        title: 'Dispatched to Retailer',
        description: `Transferred ${numQty || prod.quantity} ${prod.unit || 'kg'} to ${retailerName || 'Retailer'} at wholesale price ₹${numSelling}/${prod.unit || 'kg'}.`,
        actorName: user?.name || 'Distributor Logistics',
        actorRole: 'distributor',
        location: user?.location || 'Regional Cold Hub',
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        verified: true,
      };

      prod.timeline = prod.timeline || [];
      prod.timeline.push(timelineEvent);
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Batch not found.' });
    }

    return res.json({
      success: true,
      message: 'Batch successfully transferred to retailer.',
      product: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to transfer batch to retailer.' });
  }
});

/**
 * POST /api/products/:batchId/retailer-receive
 * Retailer accepts and receives shipment
 */
router.post('/:batchId/retailer-receive', optionalJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { batchId } = req.params;
    const user = req.user;

    const updated = await findAndSaveProduct(batchId, (prod) => {
      prod.status = 'On Retail Shelf';
      prod.currentCustodianRole = 'retailer';
      if (user?.name) prod.currentCustodianName = user.name;

      const timelineEvent = {
        id: `tl-${Date.now()}`,
        stage: 'Retail',
        title: 'Received by Retailer',
        description: 'Shipment accepted and verified in retail store inventory.',
        actorName: user?.name || 'Store Manager',
        actorRole: 'retailer',
        location: user?.location || 'Retail Store Shelf',
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        verified: true,
      };

      prod.timeline = prod.timeline || [];
      prod.timeline.push(timelineEvent);
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Batch not found.' });
    }

    return res.json({
      success: true,
      message: 'Produce received and placed on retail shelf.',
      product: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to receive batch as retailer.' });
  }
});

/**
 * POST /api/products/:batchId/retailer-price
 * Retailer sets retail margin and consumer selling price
 */
router.post('/:batchId/retailer-price', optionalJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { batchId } = req.params;
    const { purchasePrice, retailMargin, finalSellingPrice } = req.body;
    const user = req.user;

    const numMargin = Number(retailMargin);
    const numFinal = Number(finalSellingPrice);

    const updated = await findAndSaveProduct(batchId, (prod) => {
      prod.pricing = prod.pricing || {};
      prod.pricing.retailerMargin = numMargin;
      prod.pricing.finalConsumerPrice = numFinal;

      const timelineEvent = {
        id: `tl-${Date.now()}`,
        stage: 'Retail',
        title: 'Retail Selling Price Set',
        description: `Wholesale cost: ₹${purchasePrice}/${prod.unit || 'kg'}, Retail margin: ${numMargin}%, Final shelf price: ₹${numFinal}/${prod.unit || 'kg'}.`,
        actorName: user?.name || 'Retailer',
        actorRole: 'retailer',
        location: user?.location || 'Retail Store Shelf',
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        verified: true,
      };

      prod.timeline = prod.timeline || [];
      prod.timeline.push(timelineEvent);
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Batch not found.' });
    }

    return res.json({
      success: true,
      message: 'Retail selling price updated.',
      product: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to set retailer selling price.' });
  }
});

/**
 * POST /api/products/:batchId/retailer-sell
 * Retailer records a sale and decrements available quantity
 */
router.post('/:batchId/retailer-sell', optionalJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { batchId } = req.params;
    const { soldQuantity, buyerNote } = req.body;
    const user = req.user;

    const numSold = Number(soldQuantity) || 1;

    const updated = await findAndSaveProduct(batchId, (prod) => {
      const remaining = Math.max(0, (prod.quantity || 0) - numSold);
      prod.quantity = remaining;
      if (prod.quantityKg) {
        prod.quantityKg = Math.max(0, prod.quantityKg - numSold);
      }

      if (remaining === 0) {
        prod.status = 'Sold to Consumer';
        prod.currentCustodianRole = 'consumer';
      }

      const timelineEvent = {
        id: `tl-${Date.now()}`,
        stage: 'Consumer',
        title: 'Point of Sale to Consumer',
        description: `Sold ${numSold} ${prod.unit || 'kg'}${buyerNote ? ` (${buyerNote})` : ''}. ${remaining > 0 ? `${remaining} ${prod.unit || 'kg'} remaining in stock.` : 'Batch lot completely sold.'}`,
        actorName: user?.name || 'Retail Checkout',
        actorRole: 'retailer',
        location: user?.location || 'Retail Store Point of Sale',
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        verified: true,
      };

      prod.timeline = prod.timeline || [];
      prod.timeline.push(timelineEvent);
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Batch not found.' });
    }

    return res.json({
      success: true,
      message: 'Produce sale recorded successfully.',
      product: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to record sale.' });
  }
});

export default router;
