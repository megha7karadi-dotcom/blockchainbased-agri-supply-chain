import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ethers } from 'ethers';
import express from 'express';
import http from 'http';
import {
  validateTransactionMetadata,
  stringToBytes32,
  getContractAddress,
  getContractAbi
} from '../backend/services/blockchainService.js';
import productRoutes from '../backend/routes/productRoutes.js';

describe('Backend Transaction Metadata & Lifecycle Persistence Engine', () => {
  const deployedContract = '0x110D36B8FA4FAc2Fc214c1F341261BA6654a57Ef';
  const testBatchId = 'AGRI-2026-RIC-003';
  const testBatchB32 = stringToBytes32(testBatchId);
  const abi = getContractAbi();
  const iface = new ethers.Interface(abi);

  // Helper to construct a mock provider
  function createMockProvider(options: {
    receiptStatus?: number;
    receiptBlockNumber?: number;
    receiptTo?: string;
    receiptFrom?: string;
    receiptLogs?: any[];
    receiptNotFound?: boolean;
    txTo?: string;
    txFrom?: string;
    txData?: string;
    txNotFound?: boolean;
  }) {
    return {
      getBlockNumber: async () => 18946250,
      getTransactionReceipt: async (hash: string) => {
        if (options.txNotFound || options.receiptNotFound) return null;
        return {
          status: options.receiptStatus ?? 1,
          blockNumber: options.receiptBlockNumber ?? 18946210,
          to: options.receiptTo ?? deployedContract,
          from: options.receiptFrom ?? '0x700c6f0a003A81f4F8c1d5C99F065409c15466b6',
          logs: options.receiptLogs ?? [],
          hash
        };
      },
      getTransaction: async (hash: string) => {
        if (options.txNotFound) return null;
        return {
          hash,
          to: options.txTo ?? deployedContract,
          from: options.txFrom ?? '0x700c6f0a003A81f4F8c1d5C99F065409c15466b6',
          data: options.txData ?? '0x',
          value: 0n
        };
      }
    };
  }

  // ==========================================
  // 1. Transaction Metadata Validation
  // ==========================================
  describe('1. validateTransactionMetadata() Unit Tests', () => {
    it('accepts off-chain only requests without transaction metadata', async () => {
      const res = await validateTransactionMetadata(undefined, undefined);
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.metadata, undefined);
    });

    it('rejects incomplete metadata when txHash is provided without blockNumber', async () => {
      const res = await validateTransactionMetadata('0x' + 'a'.repeat(64), undefined);
      assert.strictEqual(res.valid, false);
      assert.match(res.error || '', /blockNumber.*required/i);
    });

    it('rejects incomplete metadata when blockNumber is provided without txHash', async () => {
      const res = await validateTransactionMetadata(undefined, 18946210);
      assert.strictEqual(res.valid, false);
      assert.match(res.error || '', /txHash.*required/i);
    });

    it('rejects syntactically invalid txHash formats', async () => {
      const res = await validateTransactionMetadata('0x1234', 18946210);
      assert.strictEqual(res.valid, false);
      assert.match(res.error || '', /Invalid transaction hash format/i);
    });

    it('rejects invalid or non-positive blockNumber', async () => {
      const res = await validateTransactionMetadata('0x' + 'b'.repeat(64), -5);
      assert.strictEqual(res.valid, false);
      assert.match(res.error || '', /Invalid block number/i);
    });

    it('rejects reverted on-chain transactions (status === 0)', async () => {
      const mockProvider = createMockProvider({ receiptStatus: 0 });
      const validHash = '0x' + 'c'.repeat(64);
      const res = await validateTransactionMetadata(validHash, 18946210, {
        provider: mockProvider,
        deployedAddress: deployedContract
      });
      assert.strictEqual(res.valid, false);
      assert.match(res.error || '', /failed or was reverted/i);
    });

    it('rejects block number mismatches between receipt and submission', async () => {
      const mockProvider = createMockProvider({ receiptBlockNumber: 18946210 });
      const validHash = '0x' + 'd'.repeat(64);
      const res = await validateTransactionMetadata(validHash, 18946220, {
        provider: mockProvider,
        deployedAddress: deployedContract
      });
      assert.strictEqual(res.valid, false);
      assert.match(res.error || '', /Block number mismatch/i);
    });

    it('rejects transactions whose recipient does not match deployed AgriTrace contract', async () => {
      const mockProvider = createMockProvider({ receiptTo: '0x000000000000000000000000000000000000dead' });
      const validHash = '0x' + 'e'.repeat(64);
      const res = await validateTransactionMetadata(validHash, 18946210, {
        provider: mockProvider,
        deployedAddress: deployedContract
      });
      assert.strictEqual(res.valid, false);
      assert.match(res.error || '', /does not match the deployed AgriTrace contract/i);
    });

    it('rejects non-existent transactions when node is responsive', async () => {
      const mockProvider = createMockProvider({ txNotFound: true });
      const validHash = '0x' + 'f'.repeat(64);
      const res = await validateTransactionMetadata(validHash, 18946210, {
        provider: mockProvider,
        deployedAddress: deployedContract
      });
      assert.strictEqual(res.valid, false);
      assert.match(res.error || '', /was not found on Ethereum Sepolia/i);
    });

    it('rejects transaction if contract action does not match expected lifecycle endpoint', async () => {
      // Encode recordSale calldata
      const calldata = iface.encodeFunctionData('recordSale', [testBatchB32]);
      const mockProvider = createMockProvider({ txData: calldata });
      const validHash = '0x' + '1'.repeat(64);

      // Submit to endpoint expecting updateDistributorPrice
      const res = await validateTransactionMetadata(validHash, 18946210, {
        provider: mockProvider,
        deployedAddress: deployedContract,
        expectedAction: 'updateDistributorPrice',
        batchId: testBatchId
      });
      assert.strictEqual(res.valid, false);
      assert.match(res.error || '', /Generic transaction existence does not prove the correct action occurred/i);
    });

    it('rejects transaction if target batch ID does not match the requested batch', async () => {
      const wrongBatchB32 = stringToBytes32('AGRI-2026-MNG-001');
      const calldata = iface.encodeFunctionData('updateDistributorPrice', [wrongBatchB32, 120n]);
      const mockProvider = createMockProvider({ txData: calldata });
      const validHash = '0x' + '2'.repeat(64);

      const res = await validateTransactionMetadata(validHash, 18946210, {
        provider: mockProvider,
        deployedAddress: deployedContract,
        expectedAction: 'updateDistributorPrice',
        batchId: testBatchId
      });
      assert.strictEqual(res.valid, false);
      assert.match(res.error || '', /does not match the requested batch ID/i);
    });

    it('accepts and verifies valid transaction matching receipt, contract, action, and batch', async () => {
      const calldata = iface.encodeFunctionData('updateDistributorPrice', [testBatchB32, 120n]);
      const mockProvider = createMockProvider({ txData: calldata });
      const validHash = '0x' + '3'.repeat(64);

      const res = await validateTransactionMetadata(validHash, 18946210, {
        provider: mockProvider,
        deployedAddress: deployedContract,
        expectedAction: 'updateDistributorPrice',
        batchId: testBatchId
      });
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.metadata?.onChainVerified, true);
      assert.strictEqual(res.metadata?.txHash, validHash);
      assert.strictEqual(res.metadata?.blockNumber, 18946210);
    });

    it('handles pending unmined transactions as retryable without marking verified', async () => {
      const calldata = iface.encodeFunctionData('updateDistributorPrice', [testBatchB32, 120n]);
      const mockProvider = createMockProvider({ receiptNotFound: true, txData: calldata });
      const validHash = '0x' + '4'.repeat(64);

      const res = await validateTransactionMetadata(validHash, 18946210, {
        provider: mockProvider,
        deployedAddress: deployedContract,
        expectedAction: 'updateDistributorPrice',
        batchId: testBatchId
      });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.retryable, true);
      assert.match(res.error || '', /is pending on Ethereum Sepolia/i);
    });

    it('rejects transaction when calldata is unavailable and no matching logs exist (not falsely verified)', async () => {
      const mockProvider = createMockProvider({ txData: '0x', receiptLogs: [] });
      const validHash = '0x' + '5'.repeat(64);

      const res = await validateTransactionMetadata(validHash, 18946210, {
        provider: mockProvider,
        deployedAddress: deployedContract,
        expectedAction: 'updateDistributorPrice',
        batchId: testBatchId
      });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.retryable, true);
      assert.match(res.error || '', /temporarily unavailable/i);
    });

    it('accepts and verifies transaction when calldata is pruned but receipt event logs prove action and batch', async () => {
      const eventFragment = iface.getEvent('PriceUpdated');
      const logData = iface.encodeEventLog(eventFragment!, [testBatchB32, '0x700c6f0a003A81f4F8c1d5C99F065409c15466b6', 2n, 120n, 1728800000n]);
      const mockProvider = createMockProvider({
        txData: '0x',
        receiptLogs: [{
          address: deployedContract,
          topics: logData.topics,
          data: logData.data
        }]
      });
      const validHash = '0x' + '6'.repeat(64);

      const res = await validateTransactionMetadata(validHash, 18946210, {
        provider: mockProvider,
        deployedAddress: deployedContract,
        expectedAction: 'updateDistributorPrice',
        batchId: testBatchId
      });
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.metadata?.onChainVerified, true);
      assert.strictEqual(res.metadata?.txHash, validHash);
      assert.strictEqual(res.metadata?.blockNumber, 18946210);
    });
  });

  // ==========================================
  // 2. Lifecycle Endpoints Metadata Persistence
  // ==========================================
  describe('2. Endpoint Persistence & Authoritative Metadata', () => {
    let app: express.Express;
    let server: http.Server;
    let baseUrl: string;

    it('sets up test express server', async () => {
      app = express();
      app.use(express.json());
      const routerToUse = (productRoutes as any).default || productRoutes;
      app.use('/api/products', routerToUse);

      await new Promise<void>((resolve) => {
        server = http.createServer(app);
        server.listen(0, () => {
          const port = (server.address() as any).port;
          baseUrl = `http://127.0.0.1:${port}/api/products`;
          resolve();
        });
      });
    });

    it('GET /api/products/AGRI-2026-RIC-003 returns authoritative Sepolia contract 0x110D36B8FA4FAc2Fc214c1F341261BA6654a57Ef', async () => {
      const res = await fetch(`${baseUrl}/${testBatchId}`);
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.product.blockchain.contractAddress, '0x110D36B8FA4FAc2Fc214c1F341261BA6654a57Ef');
      assert.strictEqual(json.product.status, 'At Distributor');
    });

    it('POST /api/products/:batchId/distributor-price without tx metadata persists off-chain only', async () => {
      const res = await fetch(`${baseUrl}/${testBatchId}/distributor-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchasePrice: 60,
          marginPercentage: 20,
          sellingPrice: 72
        })
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.blockchain.onChainVerified, false);
      assert.strictEqual(json.blockchain.status, 'off-chain-only');
    });

    it('POST /api/products/:batchId/distributor-price with fake tx rejects non-existent Sepolia transaction', async () => {
      const res = await fetch(`${baseUrl}/${testBatchId}/distributor-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchasePrice: 60,
          marginPercentage: 20,
          sellingPrice: 72,
          txHash: '0x' + '9'.repeat(64),
          blockNumber: 18946210
        })
      });
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.match(json.error, /was not found on Ethereum Sepolia/i);
    });

    it('POST /api/products/:batchId/transfer-to-retailer without tx metadata persists off-chain only and updates status', async () => {
      const res = await fetch(`${baseUrl}/${testBatchId}/transfer-to-retailer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerName: 'FreshRoot Retailers',
          retailerId: 'usr-ret-01',
          quantity: 25,
          sellingPrice: 100
        })
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.blockchain.onChainVerified, false);
      assert.strictEqual(json.blockchain.status, 'off-chain-only');
      assert.strictEqual(json.product.status, 'In Transit to Retailer');
      assert.strictEqual(json.product.currentCustodianRole, 'retailer');
    });

    it('POST /api/products/:batchId/transfer-to-retailer rejects incomplete tx metadata with 400', async () => {
      const res = await fetch(`${baseUrl}/${testBatchId}/transfer-to-retailer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerName: 'FreshRoot Retailers',
          retailerId: 'usr-ret-01',
          txHash: '0x' + '8'.repeat(64)
          // missing blockNumber
        })
      });
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.match(json.error, /blockNumber.*required/i);
    });

    it('POST /api/products/:batchId/retailer-receive without tx metadata places on retail shelf off-chain', async () => {
      const res = await fetch(`${baseUrl}/${testBatchId}/retailer-receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.blockchain.onChainVerified, false);
      assert.strictEqual(json.blockchain.status, 'off-chain-only');
      assert.strictEqual(json.product.status, 'On Retail Shelf');
    });

    it('POST /api/products/:batchId/retailer-sell decrements stock and updates status off-chain', async () => {
      const res = await fetch(`${baseUrl}/${testBatchId}/retailer-sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soldQuantity: 25,
          buyerNote: 'Customer Order'
        })
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.blockchain.onChainVerified, false);
      assert.strictEqual(json.blockchain.status, 'off-chain-only');
      assert.strictEqual(json.product.quantity, 225);
    });

    it('POST /api/products registers produce batch off-chain when no on-chain tx is claimed', async () => {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: 'Organic Tomato',
          cropVariety: 'Roma',
          quantity: 150,
          farmLocation: 'Nashik Valley',
          state: 'Maharashtra',
          harvestDate: '2026-10-12',
          farmgatePrice: 35
        })
      });
      assert.strictEqual(res.status, 201);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.match(json.product.blockchain.statusNotice, /Off-Chain/i);
      assert.strictEqual(json.product.timeline[0].verified, false);
      assert.strictEqual(json.product.blockchain.mintTxHash, undefined);
    });

    it('POST /api/products rejects claimed on-chain registration if tx is not verified on Sepolia', async () => {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: 'Alphonso Mango',
          quantity: 50,
          farmLocation: 'Ratnagiri',
          state: 'Maharashtra',
          harvestDate: '2026-10-10',
          farmgatePrice: 120,
          txHash: '0x' + 'e'.repeat(64),
          blockNumber: 18946210
        })
      });
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.match(json.error, /was not found on Ethereum Sepolia/i);
    });

    it('POST /api/products/:batchId/transfer-to-distributor without tx persists off-chain with verified=false', async () => {
      const res = await fetch(`${baseUrl}/${testBatchId}/transfer-to-distributor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distributorName: 'Central Agro Logistics',
          distributorId: 'usr-dist-01',
          quantity: 50,
          agreedPrice: 55
        })
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.blockchain.onChainVerified, false);
      assert.strictEqual(json.blockchain.status, 'off-chain-only');
      assert.strictEqual(json.product.status, 'Transferred to Distributor');
    });

    it('POST /api/products/:batchId/transfer-to-distributor rejects fake on-chain tx with 400', async () => {
      const res = await fetch(`${baseUrl}/${testBatchId}/transfer-to-distributor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distributorName: 'Central Agro Logistics',
          distributorId: 'usr-dist-01',
          quantity: 50,
          agreedPrice: 55,
          txHash: '0x' + '7'.repeat(64),
          blockNumber: 18946210
        })
      });
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.match(json.error, /was not found on Ethereum Sepolia/i);
    });

    it('POST /api/products/:batchId/distributor-receive without tx persists off-chain with verified=false', async () => {
      const res = await fetch(`${baseUrl}/${testBatchId}/distributor-receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: 'Inspected and unloaded at cold warehouse.'
        })
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.blockchain.onChainVerified, false);
      assert.strictEqual(json.blockchain.status, 'off-chain-only');
      assert.strictEqual(json.product.status, 'At Distributor');
    });

    it('POST /api/products/:batchId/distributor-receive rejects fake on-chain tx with 400', async () => {
      const res = await fetch(`${baseUrl}/${testBatchId}/distributor-receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: 'Inspected and unloaded at cold warehouse.',
          txHash: '0x' + 'a'.repeat(64),
          blockNumber: 18946210
        })
      });
      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.match(json.error, /was not found on Ethereum Sepolia/i);
    });

    it('preserves original mintTxHash during subsequent lifecycle updates', async () => {
      const getRes = await fetch(`${baseUrl}/${testBatchId}`);
      assert.strictEqual(getRes.status, 200);
      const getJson = await getRes.json();
      const originalMintTx = getJson.product.blockchain.mintTxHash;

      // Update off-chain distributor price
      const priceRes = await fetch(`${baseUrl}/${testBatchId}/distributor-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchasePrice: 62,
          marginPercentage: 18,
          sellingPrice: 75
        })
      });
      assert.strictEqual(priceRes.status, 200);
      const priceJson = await priceRes.json();
      assert.strictEqual(priceJson.product.blockchain.mintTxHash, originalMintTx);
    });

    it('teardown server', async () => {
      if (server) {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });
  });
});
