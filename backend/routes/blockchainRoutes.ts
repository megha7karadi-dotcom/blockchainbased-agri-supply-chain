import express, { Request, Response } from 'express';
import { 
  getContractAddress, 
  setActiveContractAddress,
  isContractConfigured,
  getRpcUrl, 
  getOnChainBatch, 
  getOnChainPriceHistory, 
  getOnChainProvenanceHistory,
  verifyProductAgainstBlockchain,
  checkRoleOnChain,
  SEPOLIA_CHAIN_ID
} from '../services/blockchainService';
import { Product } from '../models/Product';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * GET /api/blockchain/info
 * Returns contract metadata, chain ID, and network configuration
 */
router.get('/info', (req: Request, res: Response) => {
  const configured = isContractConfigured();
  const address = getContractAddress();

  res.json({
    success: true,
    network: 'Ethereum Sepolia Testnet',
    chainId: SEPOLIA_CHAIN_ID,
    contractAddress: address || null,
    isConfigured: configured,
    status: configured ? 'Connected to Sepolia Contract' : 'Awaiting Sepolia contract deployment',
    rpcUrl: getRpcUrl(),
    standards: 'Solidity ^0.8.20 + OpenZeppelin AccessControl',
    immutableRules: [
      'Role-based permissions (Farmer, Distributor, Retailer, Admin)',
      'Produce registration requires valid originHash, positive price & quantity',
      'Lifecycle transition validation on-chain before state mutation',
      'Immutable chronological price history and provenance records',
      'Final consumer sale permanently locks batch against further transfers'
    ]
  });
});

/**
 * POST /api/blockchain/contract-address
 * Sets the active contract address across frontend and backend after Sepolia deployment
 */
router.post('/contract-address', (req: Request, res: Response) => {
  try {
    const { contractAddress } = req.body;
    if (!contractAddress) {
      return res.status(400).json({ success: false, error: 'contractAddress is required' });
    }

    setActiveContractAddress(contractAddress);
    return res.json({
      success: true,
      contractAddress: getContractAddress(),
      network: 'Ethereum Sepolia',
      chainId: SEPOLIA_CHAIN_ID,
      message: 'Contract address successfully updated and synchronized across backend and frontend.'
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/blockchain/batch/:batchId
 * Authoritative on-chain lookup for a produce batch from Sepolia
 */
router.get('/batch/:batchId', async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;

    if (!isContractConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Awaiting Sepolia contract deployment. Please deploy the contract to Sepolia and supply its address.',
        contractAddress: null,
      });
    }

    const batch = await getOnChainBatch(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: `Batch "${batchId}" was not found on the AgriTrace smart contract ledger.`,
      });
    }

    const priceHistory = await getOnChainPriceHistory(batchId);
    const provenanceHistory = await getOnChainProvenanceHistory(batchId);

    return res.json({
      success: true,
      batchId,
      contractAddress: getContractAddress(),
      batch,
      priceHistory,
      provenanceHistory,
    });
  } catch (err: any) {
    console.error('Error fetching on-chain batch:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve batch from blockchain.',
      details: err?.message,
    });
  }
});

/**
 * GET /api/blockchain/verify/:batchId
 * Verifies MongoDB record against authoritative Sepolia smart contract
 */
router.get('/verify/:batchId', async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    let product: any = null;

    if (mongoose.connection.readyState === 1) {
      product = await Product.findOne({
        $or: [{ batchId }, { batchId: { $regex: new RegExp(`^${batchId}$`, 'i') } }]
      });
    }

    const verification = await verifyProductAgainstBlockchain(product || { batchId });

    return res.json({
      success: true,
      batchId,
      ...verification,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Verification lookup failed.',
      details: err?.message,
    });
  }
});

/**
 * POST /api/blockchain/check-role
 * Checks if a given wallet address holds a specific role on-chain
 */
router.post('/check-role', async (req: Request, res: Response) => {
  try {
    const { accountAddress, role } = req.body;
    if (!accountAddress || !role) {
      return res.status(400).json({ success: false, error: 'accountAddress and role are required.' });
    }

    const hasRole = await checkRoleOnChain(accountAddress, role);

    return res.json({
      success: true,
      accountAddress,
      role,
      hasRole,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to check role.' });
  }
});

export default router;
