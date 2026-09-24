import express, { Request, Response } from 'express';
import { 
  getContractAddress, 
  getRpcUrl, 
  getOnChainBatch, 
  getOnChainPriceHistory, 
  getOnChainProvenanceHistory,
  verifyProductAgainstBlockchain
} from '../services/blockchainService';
import { Product } from '../models/Product';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * GET /api/blockchain/info
 * Returns contract metadata and network configuration
 */
router.get('/info', (req: Request, res: Response) => {
  res.json({
    success: true,
    contractAddress: getContractAddress(),
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
 * GET /api/blockchain/batch/:batchId
 * Authoritative on-chain lookup for a produce batch
 */
router.get('/batch/:batchId', async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
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
 * Verifies MongoDB record against authoritative smart contract
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
 * POST /api/blockchain/rpc
 * JSON-RPC relay endpoint for in-process EVM or external node
 */
router.post('/rpc', async (req: Request, res: Response) => {
  try {
    const { handleRpcRequest } = await import('../services/blockchainService');
    const result = await handleRpcRequest(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || 1,
      error: { code: -32603, message: err.message || 'Internal RPC relay error' }
    });
  }
});

/**
 * POST /api/blockchain/grant-role
 * Authorizes a stakeholder wallet with an on-chain role (FARMER, DISTRIBUTOR, RETAILER)
 */
router.post('/grant-role', async (req: Request, res: Response) => {
  try {
    const { accountAddress, role } = req.body;
    if (!accountAddress || !role) {
      return res.status(400).json({ success: false, error: 'accountAddress and role are required.' });
    }

    const { grantRoleOnChain } = await import('../services/blockchainService');
    const result = await grantRoleOnChain(accountAddress, role);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: `Granted on-chain role ${role} to ${accountAddress}`,
      txHash: result.txHash,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to grant role.' });
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

    const { checkRoleOnChain } = await import('../services/blockchainService');
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
