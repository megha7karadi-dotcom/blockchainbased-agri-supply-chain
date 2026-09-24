import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ethers, Contract, JsonRpcSigner } from 'ethers';
import {
  setupTestEnvironment,
  expectCustomError,
  findEvent,
  TestEnv,
  loadOrCompileArtifact
} from './helpers/blockchain.js';

describe('AgriTraceSupplyChain - Blockchain Business Rules & Validation Engine', () => {
  let env: TestEnv;
  let contract: any;
  let admin: JsonRpcSigner;
  let farmer: JsonRpcSigner;
  let distributor: JsonRpcSigner;
  let retailer: JsonRpcSigner;
  let consumer: JsonRpcSigner;
  let unauthorizedUser: JsonRpcSigner;
  let otherDistributor: JsonRpcSigner;
  let otherRetailer: JsonRpcSigner;

  // Enum representations matching AgriTraceSupplyChain.sol
  const ProduceStatus = {
    NONE: 0,
    REGISTERED: 1,
    WITH_DISTRIBUTOR: 2,
    IN_TRANSIT: 3,
    WITH_RETAILER: 4,
    SOLD: 5,
  };

  const QualityGrade = {
    NONE: 0,
    GRADE_A: 1,
    GRADE_B: 2,
    GRADE_C: 3,
  };

  const sampleBatchId = ethers.keccak256(ethers.toUtf8Bytes('BATCH-AGRI-2026-001'));
  const sampleOriginHash = ethers.keccak256(ethers.toUtf8Bytes('ORIGIN-CERT-FARM-9942'));

  beforeEach(async () => {
    env = await setupTestEnvironment();
    contract = env.contract;
    admin = env.accounts.admin;
    farmer = env.accounts.farmer;
    distributor = env.accounts.distributor;
    retailer = env.accounts.retailer;
    consumer = env.accounts.consumer;
    unauthorizedUser = env.accounts.unauthorizedUser;
    otherDistributor = env.accounts.otherDistributor;
    otherRetailer = env.accounts.otherRetailer;
  });

  // ==========================================
  // 1. DEPLOYMENT TESTS
  // ==========================================
  describe('1. Deployment', () => {
    it('initialAdmin receives DEFAULT_ADMIN_ROLE', async () => {
      const adminAddress = await admin.getAddress();
      const hasDefaultAdmin = await contract.hasRole(env.roles.DEFAULT_ADMIN_ROLE, adminAddress);
      assert.equal(hasDefaultAdmin, true, 'Deployer must be granted DEFAULT_ADMIN_ROLE');
    });

    it('invalid zero-address initialAdmin is rejected', async () => {
      const artifact = loadOrCompileArtifact();
      const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, admin);

      await expectCustomError(
        factory.deploy(ethers.ZeroAddress),
        'InvalidRecipient',
        env.contractInterface,
        (args) => {
          assert.equal(args[0], ethers.ZeroAddress);
        }
      );
    });
  });

  // ==========================================
  // 2. ROLE MANAGEMENT TESTS
  // ==========================================
  describe('2. Role Management', () => {
    it('admin can grant FARMER_ROLE', async () => {
      const target = await unauthorizedUser.getAddress();
      assert.equal(await contract.hasRole(env.roles.FARMER_ROLE, target), false);

      const tx = await contract.connect(admin).grantRole(env.roles.FARMER_ROLE, target);
      await tx.wait();

      assert.equal(await contract.hasRole(env.roles.FARMER_ROLE, target), true);
    });

    it('admin can grant DISTRIBUTOR_ROLE', async () => {
      const target = await unauthorizedUser.getAddress();
      assert.equal(await contract.hasRole(env.roles.DISTRIBUTOR_ROLE, target), false);

      const tx = await contract.connect(admin).grantRole(env.roles.DISTRIBUTOR_ROLE, target);
      await tx.wait();

      assert.equal(await contract.hasRole(env.roles.DISTRIBUTOR_ROLE, target), true);
    });

    it('admin can grant RETAILER_ROLE', async () => {
      const target = await unauthorizedUser.getAddress();
      assert.equal(await contract.hasRole(env.roles.RETAILER_ROLE, target), false);

      const tx = await contract.connect(admin).grantRole(env.roles.RETAILER_ROLE, target);
      await tx.wait();

      assert.equal(await contract.hasRole(env.roles.RETAILER_ROLE, target), true);
    });

    it('unauthorized account cannot grant roles', async () => {
      const target = await unauthorizedUser.getAddress();
      await expectCustomError(
        contract.connect(unauthorizedUser).grantRole(env.roles.FARMER_ROLE, target),
        'AccessControlUnauthorizedAccount',
        env.contractInterface
      );
    });
  });

  // ==========================================
  // 3. PRODUCE REGISTRATION TESTS
  // ==========================================
  describe('3. Produce Registration', () => {
    it('authorized farmer can register valid produce', async () => {
      const tx = await contract.connect(farmer).registerProduce(
        sampleBatchId,
        'Basmati Rice',
        1000,
        QualityGrade.GRADE_A,
        50,
        sampleOriginHash
      );
      const receipt = await tx.wait();

      assert.equal(await contract.batchExists(sampleBatchId), true);
      const batch = await contract.getBatch(sampleBatchId);

      assert.equal(batch.cropName, 'Basmati Rice');
      assert.equal(batch.quantityKg, 1000n);
      assert.equal(batch.qualityGrade, BigInt(QualityGrade.GRADE_A));
      assert.equal(batch.currentOwner, await farmer.getAddress());
      assert.equal(batch.farmer, await farmer.getAddress());
      assert.equal(batch.status, BigInt(ProduceStatus.REGISTERED));
    });

    it('unauthorized account cannot register produce', async () => {
      await expectCustomError(
        contract.connect(unauthorizedUser).registerProduce(
          sampleBatchId,
          'Basmati Rice',
          1000,
          QualityGrade.GRADE_A,
          50,
          sampleOriginHash
        ),
        'UnauthorizedCaller',
        env.contractInterface,
        (args) => {
          assert.equal(args[1], env.roles.FARMER_ROLE);
        }
      );
      assert.equal(await contract.batchExists(sampleBatchId), false);
    });

    it('zero batchId is rejected', async () => {
      await expectCustomError(
        contract.connect(farmer).registerProduce(
          ethers.ZeroHash,
          'Basmati Rice',
          1000,
          QualityGrade.GRADE_A,
          50,
          sampleOriginHash
        ),
        'EmptyBatchId',
        env.contractInterface
      );
    });

    it('duplicate batchId is rejected', async () => {
      await (await contract.connect(farmer).registerProduce(
        sampleBatchId,
        'Basmati Rice',
        1000,
        QualityGrade.GRADE_A,
        50,
        sampleOriginHash
      )).wait();

      await expectCustomError(
        contract.connect(farmer).registerProduce(
          sampleBatchId,
          'Organic Wheat',
          500,
          QualityGrade.GRADE_B,
          40,
          sampleOriginHash
        ),
        'BatchAlreadyExists',
        env.contractInterface,
        (args) => {
          assert.equal(args[0], sampleBatchId);
        }
      );
    });

    it('empty crop name is rejected', async () => {
      await expectCustomError(
        contract.connect(farmer).registerProduce(
          sampleBatchId,
          '',
          1000,
          QualityGrade.GRADE_A,
          50,
          sampleOriginHash
        ),
        'EmptyCropName',
        env.contractInterface
      );
    });

    it('zero quantity is rejected', async () => {
      await expectCustomError(
        contract.connect(farmer).registerProduce(
          sampleBatchId,
          'Basmati Rice',
          0,
          QualityGrade.GRADE_A,
          50,
          sampleOriginHash
        ),
        'InvalidQuantity',
        env.contractInterface,
        (args) => {
          assert.equal(args[0], 0n);
        }
      );
    });

    it('zero initial price is rejected', async () => {
      await expectCustomError(
        contract.connect(farmer).registerProduce(
          sampleBatchId,
          'Basmati Rice',
          1000,
          QualityGrade.GRADE_A,
          0,
          sampleOriginHash
        ),
        'InvalidPrice',
        env.contractInterface,
        (args) => {
          assert.equal(args[0], 0n);
        }
      );
    });

    it('QualityGrade.NONE is rejected', async () => {
      await expectCustomError(
        contract.connect(farmer).registerProduce(
          sampleBatchId,
          'Basmati Rice',
          1000,
          QualityGrade.NONE,
          50,
          sampleOriginHash
        ),
        'InvalidQualityGrade',
        env.contractInterface
      );
    });

    it('zero originHash is rejected', async () => {
      await expectCustomError(
        contract.connect(farmer).registerProduce(
          sampleBatchId,
          'Basmati Rice',
          1000,
          QualityGrade.GRADE_A,
          50,
          ethers.ZeroHash
        ),
        'EmptyOriginInfo',
        env.contractInterface
      );
    });
  });

  // ==========================================
  // 4. OWNERSHIP TRANSFER TESTS
  // ==========================================
  describe('4. Ownership Transfer', () => {
    beforeEach(async () => {
      await (await contract.connect(farmer).registerProduce(
        sampleBatchId,
        'Basmati Rice',
        1000,
        QualityGrade.GRADE_A,
        50,
        sampleOriginHash
      )).wait();
    });

    it('farmer can transfer a REGISTERED batch to an authorized distributor', async () => {
      const distAddress = await distributor.getAddress();
      const tx = await contract.connect(farmer).transferToDistributor(sampleBatchId, distAddress);
      await tx.wait();

      assert.equal(await contract.getCurrentOwner(sampleBatchId), distAddress);
      assert.equal(await contract.getCurrentStatus(sampleBatchId), BigInt(ProduceStatus.WITH_DISTRIBUTOR));
    });

    it('unauthorized recipient is rejected', async () => {
      const unauthAddress = await unauthorizedUser.getAddress();
      await expectCustomError(
        contract.connect(farmer).transferToDistributor(sampleBatchId, unauthAddress),
        'RecipientMissingRole',
        env.contractInterface,
        (args) => {
          assert.equal(args[0], unauthAddress);
          assert.equal(args[1], env.roles.DISTRIBUTOR_ROLE);
        }
      );
      assert.equal(await contract.getCurrentOwner(sampleBatchId), await farmer.getAddress());
    });

    it('transfer to zero address is rejected', async () => {
      await expectCustomError(
        contract.connect(farmer).transferToDistributor(sampleBatchId, ethers.ZeroAddress),
        'InvalidRecipient',
        env.contractInterface
      );
    });

    it('transfer to self is rejected', async () => {
      await expectCustomError(
        contract.connect(farmer).transferToDistributor(sampleBatchId, await farmer.getAddress()),
        'CannotTransferToSelf',
        env.contractInterface
      );
    });

    it('non-owner cannot transfer', async () => {
      const distAddress = await distributor.getAddress();
      await expectCustomError(
        contract.connect(unauthorizedUser).transferToDistributor(sampleBatchId, distAddress),
        'NotCurrentOwner',
        env.contractInterface
      );
    });

    it('invalid lifecycle transition is rejected', async () => {
      const distAddress = await distributor.getAddress();
      await (await contract.connect(farmer).transferToDistributor(sampleBatchId, distAddress)).wait();

      // Batch is now WITH_DISTRIBUTOR; attempting transferToDistributor again must fail
      const otherDistAddress = await otherDistributor.getAddress();
      await expectCustomError(
        contract.connect(distributor).transferToDistributor(sampleBatchId, otherDistAddress),
        'InvalidLifecycleTransition',
        env.contractInterface,
        (args) => {
          assert.equal(args[0], BigInt(ProduceStatus.WITH_DISTRIBUTOR));
          assert.equal(args[1], BigInt(ProduceStatus.WITH_DISTRIBUTOR));
        }
      );
    });
  });

  // ==========================================
  // 5. DISTRIBUTOR PRICING TESTS
  // ==========================================
  describe('5. Distributor Pricing', () => {
    beforeEach(async () => {
      await (await contract.connect(farmer).registerProduce(
        sampleBatchId,
        'Basmati Rice',
        1000,
        QualityGrade.GRADE_A,
        50,
        sampleOriginHash
      )).wait();
      await (await contract.connect(farmer).transferToDistributor(sampleBatchId, await distributor.getAddress())).wait();
    });

    it('current distributor can update price', async () => {
      const tx = await contract.connect(distributor).updateDistributorPrice(sampleBatchId, 70);
      await tx.wait();

      const priceHistory = await contract.getPriceHistory(sampleBatchId);
      assert.equal(priceHistory.length, 2);
      assert.equal(priceHistory[1].pricePerKg, 70n);
      assert.equal(priceHistory[1].setBy, await distributor.getAddress());
      assert.equal(priceHistory[1].stage, BigInt(ProduceStatus.WITH_DISTRIBUTOR));
    });

    it('zero price is rejected', async () => {
      await expectCustomError(
        contract.connect(distributor).updateDistributorPrice(sampleBatchId, 0),
        'InvalidPrice',
        env.contractInterface
      );
    });

    it('non-distributor cannot update distributor price', async () => {
      await expectCustomError(
        contract.connect(farmer).updateDistributorPrice(sampleBatchId, 75),
        'NotCurrentOwner',
        env.contractInterface
      );
    });

    it('wrong lifecycle stage is rejected', async () => {
      const batch2Id = ethers.keccak256(ethers.toUtf8Bytes('BATCH-002'));
      await (await contract.connect(farmer).registerProduce(
        batch2Id,
        'Wheat',
        500,
        QualityGrade.GRADE_B,
        30,
        sampleOriginHash
      )).wait();

      // Batch is still REGISTERED with farmer; calling updateDistributorPrice must fail
      await expectCustomError(
        contract.connect(distributor).updateDistributorPrice(batch2Id, 45),
        'NotCurrentOwner',
        env.contractInterface
      );
    });

    it('previous price remains in price history', async () => {
      const initialHistory = await contract.getPriceHistory(sampleBatchId);
      assert.equal(initialHistory.length, 1);
      assert.equal(initialHistory[0].pricePerKg, 50n);

      await (await contract.connect(distributor).updateDistributorPrice(sampleBatchId, 68)).wait();

      const updatedHistory = await contract.getPriceHistory(sampleBatchId);
      assert.equal(updatedHistory.length, 2);
      assert.equal(updatedHistory[0].pricePerKg, 50n, 'Farmer origin price must not be overwritten');
      assert.equal(updatedHistory[1].pricePerKg, 68n, 'Distributor price appended');
    });
  });

  // ==========================================
  // 6. DISTRIBUTOR TO RETAILER WORKFLOW
  // ==========================================
  describe('6. Distributor to Retailer Workflow', () => {
    beforeEach(async () => {
      await (await contract.connect(farmer).registerProduce(
        sampleBatchId,
        'Basmati Rice',
        1000,
        QualityGrade.GRADE_A,
        50,
        sampleOriginHash
      )).wait();
      await (await contract.connect(farmer).transferToDistributor(sampleBatchId, await distributor.getAddress())).wait();
      await (await contract.connect(distributor).updateDistributorPrice(sampleBatchId, 70)).wait();
    });

    it('authorized distributor can dispatch a batch to an authorized retailer', async () => {
      const retAddress = await retailer.getAddress();
      const tx = await contract.connect(distributor).dispatchToRetailer(sampleBatchId, retAddress);
      await tx.wait();

      assert.equal(await contract.getCurrentStatus(sampleBatchId), BigInt(ProduceStatus.IN_TRANSIT));
      const batch = await contract.getBatch(sampleBatchId);
      assert.equal(batch.designatedRecipient, retAddress);
    });

    it('invalid retailer is rejected', async () => {
      const unauthAddress = await unauthorizedUser.getAddress();
      await expectCustomError(
        contract.connect(distributor).dispatchToRetailer(sampleBatchId, unauthAddress),
        'RecipientMissingRole',
        env.contractInterface,
        (args) => {
          assert.equal(args[0], unauthAddress);
          assert.equal(args[1], env.roles.RETAILER_ROLE);
        }
      );
    });

    it('unauthorized caller is rejected', async () => {
      const retAddress = await retailer.getAddress();
      await expectCustomError(
        contract.connect(unauthorizedUser).dispatchToRetailer(sampleBatchId, retAddress),
        'NotCurrentOwner',
        env.contractInterface
      );
    });

    it('invalid lifecycle transition is rejected', async () => {
      // Dispatch once
      await (await contract.connect(distributor).dispatchToRetailer(sampleBatchId, await retailer.getAddress())).wait();

      // Second dispatch attempt when status is already IN_TRANSIT must revert
      await expectCustomError(
        contract.connect(distributor).dispatchToRetailer(sampleBatchId, await otherRetailer.getAddress()),
        'InvalidLifecycleTransition',
        env.contractInterface
      );
    });

    it('only the designated retailer can receive the batch', async () => {
      const retailerAddress = await retailer.getAddress();
      const otherRetailerAddress = await otherRetailer.getAddress();

      await (await contract.connect(distributor).dispatchToRetailer(sampleBatchId, retailerAddress)).wait();

      // otherRetailer has RETAILER_ROLE, but is not the designated recipient
      await expectCustomError(
        contract.connect(otherRetailer).receiveProduceByRetailer(sampleBatchId),
        'NotDesignatedRecipient',
        env.contractInterface,
        (args) => {
          assert.equal(args[0], otherRetailerAddress);
          assert.equal(args[1], retailerAddress);
        }
      );

      // Designated retailer receives produce
      const tx = await contract.connect(retailer).receiveProduceByRetailer(sampleBatchId);
      await tx.wait();

      assert.equal(await contract.getCurrentOwner(sampleBatchId), await retailer.getAddress());
      assert.equal(await contract.getCurrentStatus(sampleBatchId), BigInt(ProduceStatus.WITH_RETAILER));
    });
  });

  // ==========================================
  // 7. RETAILER PRICING TESTS
  // ==========================================
  describe('7. Retailer Pricing', () => {
    beforeEach(async () => {
      await (await contract.connect(farmer).registerProduce(
        sampleBatchId,
        'Basmati Rice',
        1000,
        QualityGrade.GRADE_A,
        50,
        sampleOriginHash
      )).wait();
      await (await contract.connect(farmer).transferToDistributor(sampleBatchId, await distributor.getAddress())).wait();
      await (await contract.connect(distributor).updateDistributorPrice(sampleBatchId, 70)).wait();
      await (await contract.connect(distributor).dispatchToRetailer(sampleBatchId, await retailer.getAddress())).wait();
      await (await contract.connect(retailer).receiveProduceByRetailer(sampleBatchId)).wait();
    });

    it('authorized retailer can update price', async () => {
      const tx = await contract.connect(retailer).updateRetailerPrice(sampleBatchId, 95);
      await tx.wait();

      const priceHistory = await contract.getPriceHistory(sampleBatchId);
      assert.equal(priceHistory.length, 3);
      assert.equal(priceHistory[2].pricePerKg, 95n);
      assert.equal(priceHistory[2].setBy, await retailer.getAddress());
      assert.equal(priceHistory[2].stage, BigInt(ProduceStatus.WITH_RETAILER));
    });

    it('zero price is rejected', async () => {
      await expectCustomError(
        contract.connect(retailer).updateRetailerPrice(sampleBatchId, 0),
        'InvalidPrice',
        env.contractInterface
      );
    });

    it('unauthorized caller is rejected', async () => {
      await expectCustomError(
        contract.connect(distributor).updateRetailerPrice(sampleBatchId, 99),
        'NotCurrentOwner',
        env.contractInterface
      );
    });

    it('wrong lifecycle stage is rejected', async () => {
      // Create new batch at REGISTERED stage
      const batchWheat = ethers.keccak256(ethers.toUtf8Bytes('BATCH-WHEAT-STAGE'));
      await (await contract.connect(farmer).registerProduce(
        batchWheat,
        'Wheat',
        400,
        QualityGrade.GRADE_B,
        25,
        sampleOriginHash
      )).wait();

      await expectCustomError(
        contract.connect(retailer).updateRetailerPrice(batchWheat, 45),
        'NotCurrentOwner',
        env.contractInterface
      );
    });

    it('previous prices remain unchanged', async () => {
      await (await contract.connect(retailer).updateRetailerPrice(sampleBatchId, 99)).wait();

      const history = await contract.getPriceHistory(sampleBatchId);
      assert.equal(history.length, 3);
      assert.equal(history[0].pricePerKg, 50n);
      assert.equal(history[1].pricePerKg, 70n);
      assert.equal(history[2].pricePerKg, 99n);
    });
  });

  // ==========================================
  // 8. SALE & TERMINAL LIFECYCLE TESTS
  // ==========================================
  describe('8. Final Sale', () => {
    beforeEach(async () => {
      await (await contract.connect(farmer).registerProduce(
        sampleBatchId,
        'Basmati Rice',
        1000,
        QualityGrade.GRADE_A,
        50,
        sampleOriginHash
      )).wait();
      await (await contract.connect(farmer).transferToDistributor(sampleBatchId, await distributor.getAddress())).wait();
      await (await contract.connect(distributor).updateDistributorPrice(sampleBatchId, 70)).wait();
      await (await contract.connect(distributor).dispatchToRetailer(sampleBatchId, await retailer.getAddress())).wait();
      await (await contract.connect(retailer).receiveProduceByRetailer(sampleBatchId)).wait();
      await (await contract.connect(retailer).updateRetailerPrice(sampleBatchId, 95)).wait();
    });

    it('authorized current retailer can record sale', async () => {
      const tx = await contract.connect(retailer).recordSale(sampleBatchId);
      await tx.wait();

      assert.equal(await contract.getCurrentStatus(sampleBatchId), BigInt(ProduceStatus.SOLD));
      assert.equal(await contract.isBatchSold(sampleBatchId), true);
    });

    it('sold batch cannot be modified', async () => {
      await (await contract.connect(retailer).recordSale(sampleBatchId)).wait();

      // Attempting to record sale again on sold batch reverts
      await expectCustomError(
        contract.connect(retailer).recordSale(sampleBatchId),
        'BatchAlreadySold',
        env.contractInterface
      );
    });

    it('sold batch cannot be transferred', async () => {
      await (await contract.connect(retailer).recordSale(sampleBatchId)).wait();

      await expectCustomError(
        contract.connect(retailer).transferOwnership(
          sampleBatchId,
          await distributor.getAddress(),
          ProduceStatus.WITH_DISTRIBUTOR
        ),
        'BatchAlreadySold',
        env.contractInterface
      );
    });

    it('sold batch cannot receive further price updates', async () => {
      await (await contract.connect(retailer).recordSale(sampleBatchId)).wait();

      await expectCustomError(
        contract.connect(retailer).updateRetailerPrice(sampleBatchId, 120),
        'BatchAlreadySold',
        env.contractInterface
      );
    });
  });

  // ==========================================
  // 9. READ FUNCTIONS TESTS
  // ==========================================
  describe('9. Read Functions', () => {
    beforeEach(async () => {
      await (await contract.connect(farmer).registerProduce(
        sampleBatchId,
        'Basmati Rice',
        1000,
        QualityGrade.GRADE_A,
        50,
        sampleOriginHash
      )).wait();
    });

    it('getBatch returns correct data', async () => {
      const batch = await contract.getBatch(sampleBatchId);
      assert.equal(batch.batchId, sampleBatchId);
      assert.equal(batch.cropName, 'Basmati Rice');
      assert.equal(batch.quantityKg, 1000n);
      assert.equal(batch.qualityGrade, BigInt(QualityGrade.GRADE_A));
      assert.equal(batch.originHash, sampleOriginHash);
      assert.equal(batch.currentOwner, await farmer.getAddress());
      assert.equal(batch.farmer, await farmer.getAddress());
      assert.equal(batch.status, BigInt(ProduceStatus.REGISTERED));
    });

    it('getCurrentOwner returns correct owner', async () => {
      assert.equal(await contract.getCurrentOwner(sampleBatchId), await farmer.getAddress());
    });

    it('getCurrentStatus returns correct status', async () => {
      assert.equal(await contract.getCurrentStatus(sampleBatchId), BigInt(ProduceStatus.REGISTERED));
    });

    it('getPriceHistory returns chronological price records', async () => {
      await (await contract.connect(farmer).transferToDistributor(sampleBatchId, await distributor.getAddress())).wait();
      await (await contract.connect(distributor).updateDistributorPrice(sampleBatchId, 72)).wait();

      const history = await contract.getPriceHistory(sampleBatchId);
      assert.equal(history.length, 2);
      assert.equal(history[0].pricePerKg, 50n);
      assert.equal(history[0].stage, BigInt(ProduceStatus.REGISTERED));
      assert.equal(history[1].pricePerKg, 72n);
      assert.equal(history[1].stage, BigInt(ProduceStatus.WITH_DISTRIBUTOR));
      assert.ok(history[1].timestamp >= history[0].timestamp);
    });

    it('getProvenanceHistory returns chronological provenance records', async () => {
      await (await contract.connect(farmer).transferToDistributor(sampleBatchId, await distributor.getAddress())).wait();
      await (await contract.connect(distributor).updateDistributorPrice(sampleBatchId, 72)).wait();
      await (await contract.connect(distributor).dispatchToRetailer(sampleBatchId, await retailer.getAddress())).wait();
      await (await contract.connect(retailer).receiveProduceByRetailer(sampleBatchId)).wait();
      await (await contract.connect(retailer).recordSale(sampleBatchId)).wait();

      const provenance = await contract.getProvenanceHistory(sampleBatchId);
      assert.equal(provenance.length, 6);
      assert.equal(provenance[0].toStatus, BigInt(ProduceStatus.REGISTERED));
      assert.equal(provenance[1].toStatus, BigInt(ProduceStatus.WITH_DISTRIBUTOR));
      assert.equal(provenance[2].priceAtStep, 72n);
      assert.equal(provenance[3].toStatus, BigInt(ProduceStatus.IN_TRANSIT));
      assert.equal(provenance[4].toStatus, BigInt(ProduceStatus.WITH_RETAILER));
      assert.equal(provenance[5].toStatus, BigInt(ProduceStatus.SOLD));
    });

    it('getTotalBatches increments correctly', async () => {
      const initialCount = await contract.getTotalBatches();
      assert.equal(initialCount, 1n);

      const batch2 = ethers.keccak256(ethers.toUtf8Bytes('BATCH-2-INC'));
      await (await contract.connect(farmer).registerProduce(
        batch2,
        'Soybeans',
        800,
        QualityGrade.GRADE_B,
        35,
        sampleOriginHash
      )).wait();

      const newCount = await contract.getTotalBatches();
      assert.equal(newCount, 2n);
    });

    it('getBatchIdAtIndex returns registered batch IDs', async () => {
      const retrievedId = await contract.getBatchIdAtIndex(0);
      assert.equal(retrievedId, sampleBatchId);
    });
  });

  // ==========================================
  // 10. EVENTS VERIFICATION
  // ==========================================
  describe('10. Events', () => {
    it('ProduceRegistered event is emitted upon registration', async () => {
      const newBatch = ethers.keccak256(ethers.toUtf8Bytes('EVENT-BATCH-1'));
      const tx = await contract.connect(farmer).registerProduce(
        newBatch,
        'Sweet Corn',
        300,
        QualityGrade.GRADE_A,
        22,
        sampleOriginHash
      );
      const receipt = await tx.wait();

      const event = findEvent(receipt, env.contractInterface, 'ProduceRegistered');
      assert.equal(event.args.batchId, newBatch);
      assert.equal(event.args.farmer, await farmer.getAddress());
      assert.equal(event.args.cropName, 'Sweet Corn');
      assert.equal(event.args.quantityKg, 300n);
      assert.equal(event.args.initialPricePerKg, 22n);
      assert.equal(event.args.originHash, sampleOriginHash);
    });

    it('OwnershipTransferred and StatusChanged events emitted on transfer', async () => {
      await (await contract.connect(farmer).registerProduce(
        sampleBatchId,
        'Basmati Rice',
        1000,
        QualityGrade.GRADE_A,
        50,
        sampleOriginHash
      )).wait();

      const tx = await contract.connect(farmer).transferToDistributor(sampleBatchId, await distributor.getAddress());
      const receipt = await tx.wait();

      const transferEvent = findEvent(receipt, env.contractInterface, 'OwnershipTransferred');
      assert.equal(transferEvent.args.batchId, sampleBatchId);
      assert.equal(transferEvent.args.previousOwner, await farmer.getAddress());
      assert.equal(transferEvent.args.newOwner, await distributor.getAddress());
      assert.equal(transferEvent.args.newStatus, BigInt(ProduceStatus.WITH_DISTRIBUTOR));

      const statusEvent = findEvent(receipt, env.contractInterface, 'StatusChanged');
      assert.equal(statusEvent.args.batchId, sampleBatchId);
      assert.equal(statusEvent.args.previousStatus, BigInt(ProduceStatus.REGISTERED));
      assert.equal(statusEvent.args.newStatus, BigInt(ProduceStatus.WITH_DISTRIBUTOR));
      assert.equal(statusEvent.args.triggeredBy, await farmer.getAddress());
    });

    it('PriceUpdated event emitted on price modification', async () => {
      await (await contract.connect(farmer).registerProduce(
        sampleBatchId,
        'Basmati Rice',
        1000,
        QualityGrade.GRADE_A,
        50,
        sampleOriginHash
      )).wait();
      await (await contract.connect(farmer).transferToDistributor(sampleBatchId, await distributor.getAddress())).wait();

      const tx = await contract.connect(distributor).updateDistributorPrice(sampleBatchId, 75);
      const receipt = await tx.wait();

      const priceEvent = findEvent(receipt, env.contractInterface, 'PriceUpdated');
      assert.equal(priceEvent.args.batchId, sampleBatchId);
      assert.equal(priceEvent.args.updatedBy, await distributor.getAddress());
      assert.equal(priceEvent.args.stage, BigInt(ProduceStatus.WITH_DISTRIBUTOR));
      assert.equal(priceEvent.args.pricePerKg, 75n);
    });
  });

  // ==========================================
  // 11. REVERT & STATE INTEGRITY BEHAVIOR
  // ==========================================
  describe('11. Revert & State Invariance', () => {
    it('failed transfer preserves original owner and lifecycle stage', async () => {
      await (await contract.connect(farmer).registerProduce(
        sampleBatchId,
        'Basmati Rice',
        1000,
        QualityGrade.GRADE_A,
        50,
        sampleOriginHash
      )).wait();

      const unauthAddress = await unauthorizedUser.getAddress();

      // Trigger custom error revert
      await expectCustomError(
        contract.connect(farmer).transferToDistributor(sampleBatchId, unauthAddress),
        'RecipientMissingRole',
        env.contractInterface
      );

      // Verify state was completely rolled back / unmodified
      assert.equal(await contract.getCurrentOwner(sampleBatchId), await farmer.getAddress());
      assert.equal(await contract.getCurrentStatus(sampleBatchId), BigInt(ProduceStatus.REGISTERED));
      const provenance = await contract.getProvenanceHistory(sampleBatchId);
      assert.equal(provenance.length, 1, 'Failed transaction must not write to provenance');
    });

    it('failed price update leaves price history count and values intact', async () => {
      await (await contract.connect(farmer).registerProduce(
        sampleBatchId,
        'Basmati Rice',
        1000,
        QualityGrade.GRADE_A,
        50,
        sampleOriginHash
      )).wait();
      await (await contract.connect(farmer).transferToDistributor(sampleBatchId, await distributor.getAddress())).wait();

      // Attempt invalid 0 price
      await expectCustomError(
        contract.connect(distributor).updateDistributorPrice(sampleBatchId, 0),
        'InvalidPrice',
        env.contractInterface
      );

      const history = await contract.getPriceHistory(sampleBatchId);
      assert.equal(history.length, 1, 'Price history count must remain 1 after reverted price update');
      assert.equal(history[0].pricePerKg, 50n);
    });
  });
});
