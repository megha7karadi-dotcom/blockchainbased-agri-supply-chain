// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AgriTraceSupplyChain
 * @notice Production-grade Solidity smart contract serving as the core business-rule,
 *         validation, and state-machine enforcement layer for agricultural produce.
 * @dev Rejects invalid supply-chain operations on-chain before any state mutations occur.
 *      Hybrid architecture: Canonical lifecycle, ownership, price history, and origin hashes
 *      are cryptographically enforced on-chain. Rich unstructured data remains in MongoDB Atlas.
 */
contract AgriTraceSupplyChain is AccessControl {

    // ==========================================
    // ROLES
    // ==========================================
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");

    // ==========================================
    // ENUMS
    // ==========================================
    enum ProduceStatus {
        NONE,             // 0: Non-existent / Unregistered
        REGISTERED,       // 1: Produced and registered by Farmer
        WITH_DISTRIBUTOR, // 2: Held in inventory by verified Distributor
        IN_TRANSIT,       // 3: Dispatched by Distributor towards Retailer
        WITH_RETAILER,    // 4: Received and placed on shelf by Retailer
        SOLD              // 5: Purchased by end consumer (Terminal state)
    }

    enum QualityGrade {
        NONE,    // 0: Invalid / Unspecified
        GRADE_A, // 1: Premium export/high-quality
        GRADE_B, // 2: Standard commercial grade
        GRADE_C  // 3: Processed / fair grade
    }

    // ==========================================
    // STRUCTS
    // ==========================================
    struct ProduceBatch {
        bytes32 batchId;               // Unique cryptographic batch identifier
        string cropName;               // Name of crop (e.g. "Organic Basmati Rice")
        uint256 quantityKg;            // Net batch quantity in kg
        QualityGrade qualityGrade;     // Validated quality classification
        bytes32 originHash;            // Keccak256 hash of origin geo, farm certificate, harvest record
        address currentOwner;          // Current custodian/legal owner of the batch
        address farmer;                // Original farmer who harvested & registered the batch
        address designatedRecipient;   // Pending recipient when batch is in transit
        ProduceStatus status;          // Current position in state machine
        uint256 createdAt;             // Registration timestamp
        uint256 lastUpdatedAt;         // Timestamp of latest update
    }

    struct PriceRecord {
        uint256 pricePerKg;            // Price recorded at this stage (in smallest currency unit / wei)
        address setBy;                 // Stakeholder address who recorded the price
        ProduceStatus stage;           // Lifecycle stage at time of pricing
        uint256 timestamp;             // Block timestamp
    }

    struct ProvenanceRecord {
        ProduceStatus fromStatus;      // Status prior to this action
        ProduceStatus toStatus;        // Status after this action
        address actor;                 // Stakeholder executing the transaction
        address fromOwner;             // Previous owner
        address toOwner;               // New owner
        uint256 priceAtStep;           // Active price at this stage (0 if unchanged)
        string remarks;                // Action description or verification note
        uint256 timestamp;             // Block timestamp
    }

    // ==========================================
    // STATE STORAGE
    // ==========================================
    mapping(bytes32 => ProduceBatch) private _batches;
    mapping(bytes32 => PriceRecord[]) private _priceHistory;
    mapping(bytes32 => ProvenanceRecord[]) private _provenanceHistory;
    bytes32[] private _allBatchIds;

    // ==========================================
    // CUSTOM ERRORS
    // ==========================================
    error UnauthorizedCaller(address caller, bytes32 requiredRole);
    error NotCurrentOwner(address caller, address currentOwner);
    error NotDesignatedRecipient(address caller, address designatedRecipient);
    error BatchAlreadyExists(bytes32 batchId);
    error BatchNotFound(bytes32 batchId);
    error BatchAlreadySold(bytes32 batchId);
    error EmptyBatchId();
    error EmptyCropName();
    error InvalidQuantity(uint256 quantity);
    error InvalidPrice(uint256 price);
    error InvalidQualityGrade();
    error EmptyOriginInfo();
    error InvalidRecipient(address recipient);
    error RecipientMissingRole(address recipient, bytes32 requiredRole);
    error InvalidLifecycleTransition(ProduceStatus currentStatus, ProduceStatus targetStatus);
    error CannotTransferToSelf();

    // ==========================================
    // EVENTS
    // ==========================================
    event ProduceRegistered(
        bytes32 indexed batchId,
        address indexed farmer,
        string cropName,
        uint256 quantityKg,
        QualityGrade qualityGrade,
        uint256 initialPricePerKg,
        bytes32 originHash,
        uint256 timestamp
    );

    event OwnershipTransferred(
        bytes32 indexed batchId,
        address indexed previousOwner,
        address indexed newOwner,
        ProduceStatus newStatus,
        uint256 timestamp
    );

    event PriceUpdated(
        bytes32 indexed batchId,
        address indexed updatedBy,
        ProduceStatus indexed stage,
        uint256 pricePerKg,
        uint256 timestamp
    );

    event StatusChanged(
        bytes32 indexed batchId,
        ProduceStatus previousStatus,
        ProduceStatus newStatus,
        address indexed triggeredBy,
        uint256 timestamp
    );

    // ==========================================
    // MODIFIERS FOR VALIDATION
    // ==========================================
    modifier onlyActiveBatch(bytes32 batchId) {
        _validateActiveBatch(batchId);
        _;
    }

    modifier onlyCurrentOwner(bytes32 batchId) {
        _validateCurrentOwner(batchId);
        _;
    }

    // ==========================================
    // INTERNAL OPTIMIZED VALIDATION & LOG HELPERS
    // ==========================================
    function _validateActiveBatch(bytes32 batchId) internal view returns (ProduceBatch storage batch) {
        batch = _batches[batchId];
        if (batch.status == ProduceStatus.NONE) {
            revert BatchNotFound(batchId);
        }
        if (batch.status == ProduceStatus.SOLD) {
            revert BatchAlreadySold(batchId);
        }
    }

    function _validateCurrentOwner(bytes32 batchId) internal view {
        address currentOwner = _batches[batchId].currentOwner;
        if (currentOwner != msg.sender) {
            revert NotCurrentOwner(msg.sender, currentOwner);
        }
    }

    function _getActiveBatchAndOwner(bytes32 batchId) internal view returns (ProduceBatch storage batch) {
        batch = _validateActiveBatch(batchId);
        if (batch.currentOwner != msg.sender) {
            revert NotCurrentOwner(msg.sender, batch.currentOwner);
        }
    }

    function _validateRole(bytes32 requiredRole) internal view {
        if (!hasRole(requiredRole, msg.sender)) {
            revert UnauthorizedCaller(msg.sender, requiredRole);
        }
    }

    function _validateRecipient(address recipient, bytes32 requiredRole) internal view {
        if (recipient == address(0)) {
            revert InvalidRecipient(address(0));
        }
        if (recipient == msg.sender) {
            revert CannotTransferToSelf();
        }
        if (!hasRole(requiredRole, recipient)) {
            revert RecipientMissingRole(recipient, requiredRole);
        }
    }

    function _requireBatchExists(bytes32 batchId) internal view {
        if (_batches[batchId].status == ProduceStatus.NONE) {
            revert BatchNotFound(batchId);
        }
    }

    function _addProvenance(
        bytes32 batchId,
        ProduceStatus fromStatus,
        ProduceStatus toStatus,
        address fromOwner,
        address toOwner,
        uint256 priceAtStep,
        string memory remarks
    ) internal {
        _provenanceHistory[batchId].push(ProvenanceRecord({
            fromStatus: fromStatus,
            toStatus: toStatus,
            actor: msg.sender,
            fromOwner: fromOwner,
            toOwner: toOwner,
            priceAtStep: priceAtStep,
            remarks: remarks,
            timestamp: block.timestamp
        }));
    }

    function _addPriceRecord(
        bytes32 batchId,
        uint256 pricePerKg,
        ProduceStatus stage
    ) internal {
        _priceHistory[batchId].push(PriceRecord({
            pricePerKg: pricePerKg,
            setBy: msg.sender,
            stage: stage,
            timestamp: block.timestamp
        }));
        emit PriceUpdated(batchId, msg.sender, stage, pricePerKg, block.timestamp);
    }

    function _executeOwnershipTransfer(
        bytes32 batchId,
        ProduceBatch storage batch,
        address newOwner,
        ProduceStatus newStatus,
        string memory remarks
    ) internal {
        address previousOwner = batch.currentOwner;
        ProduceStatus previousStatus = batch.status;

        batch.currentOwner = newOwner;
        batch.status = newStatus;
        batch.designatedRecipient = address(0);
        batch.lastUpdatedAt = block.timestamp;

        _addProvenance(batchId, previousStatus, newStatus, previousOwner, newOwner, 0, remarks);
        emit OwnershipTransferred(batchId, previousOwner, newOwner, newStatus, block.timestamp);
        emit StatusChanged(batchId, previousStatus, newStatus, msg.sender, block.timestamp);
    }

    // ==========================================
    // CONSTRUCTOR
    // ==========================================
    /**
     * @notice Initializes the AgriTrace contract with an initial administrator.
     * @param initialAdmin Address receiving the default admin role.
     */
    constructor(address initialAdmin) {
        if (initialAdmin == address(0)) {
            revert InvalidRecipient(address(0));
        }
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
    }

    // ==========================================
    // 1. PRODUCE REGISTRATION (FARMER)
    // ==========================================
    /**
     * @notice Registers a new produce batch on the immutable ledger.
     * @dev Validates caller role, parameters, and batch uniqueness before changing state.
     * @param batchId Cryptographic identifier for the batch (e.g. keccak256 hash or UUID converted to bytes32).
     * @param cropName Descriptive crop name (cannot be empty).
     * @param quantityKg Positive net weight in kilograms.
     * @param qualityGrade Classification (GRADE_A, GRADE_B, or GRADE_C).
     * @param initialPricePerKg Initial farm-gate price per kg (> 0).
     * @param originHash Non-zero keccak256 hash of origin geo-coordinates, certifications, or farm registration.
     */
    function registerProduce(
        bytes32 batchId,
        string calldata cropName,
        uint256 quantityKg,
        QualityGrade qualityGrade,
        uint256 initialPricePerKg,
        bytes32 originHash
    ) external {
        _validateRole(FARMER_ROLE);

        if (batchId == bytes32(0)) {
            revert EmptyBatchId();
        }
        if (_batches[batchId].status != ProduceStatus.NONE) {
            revert BatchAlreadyExists(batchId);
        }
        if (bytes(cropName).length == 0) {
            revert EmptyCropName();
        }
        if (quantityKg == 0) {
            revert InvalidQuantity(quantityKg);
        }
        if (initialPricePerKg == 0) {
            revert InvalidPrice(initialPricePerKg);
        }
        if (qualityGrade == QualityGrade.NONE) {
            revert InvalidQualityGrade();
        }
        if (originHash == bytes32(0)) {
            revert EmptyOriginInfo();
        }

        _allBatchIds.push(batchId);

        _batches[batchId] = ProduceBatch({
            batchId: batchId,
            cropName: cropName,
            quantityKg: quantityKg,
            qualityGrade: qualityGrade,
            originHash: originHash,
            currentOwner: msg.sender,
            farmer: msg.sender,
            designatedRecipient: address(0),
            status: ProduceStatus.REGISTERED,
            createdAt: block.timestamp,
            lastUpdatedAt: block.timestamp
        });

        _addPriceRecord(batchId, initialPricePerKg, ProduceStatus.REGISTERED);
        _addProvenance(batchId, ProduceStatus.NONE, ProduceStatus.REGISTERED, address(0), msg.sender, initialPricePerKg, "Produce batch registered at farm origin");

        emit ProduceRegistered(
            batchId,
            msg.sender,
            cropName,
            quantityKg,
            qualityGrade,
            initialPricePerKg,
            originHash,
            block.timestamp
        );

        emit StatusChanged(
            batchId,
            ProduceStatus.NONE,
            ProduceStatus.REGISTERED,
            msg.sender,
            block.timestamp
        );
    }

    // ==========================================
    // 2. TRANSFER TO DISTRIBUTOR
    // ==========================================
    /**
     * @notice Transfers batch ownership from the Farmer to a verified Distributor.
     * @dev Validates batch status, caller ownership, and recipient role before mutating state.
     * @param batchId The batch identifier.
     * @param distributor Address of verified distributor holding DISTRIBUTOR_ROLE.
     */
    function transferToDistributor(
        bytes32 batchId,
        address distributor
    ) external {
        ProduceBatch storage batch = _getActiveBatchAndOwner(batchId);

        if (batch.status != ProduceStatus.REGISTERED) {
            revert InvalidLifecycleTransition(batch.status, ProduceStatus.WITH_DISTRIBUTOR);
        }

        _validateRecipient(distributor, DISTRIBUTOR_ROLE);

        _executeOwnershipTransfer(
            batchId,
            batch,
            distributor,
            ProduceStatus.WITH_DISTRIBUTOR,
            "Ownership transferred from Farmer to verified Distributor"
        );
    }

    // ==========================================
    // 3. DISTRIBUTOR PRICE UPDATE
    // ==========================================
    /**
     * @notice Allows the current distributor holding the batch to record their updated pricing.
     * @dev Appends an immutable price record; historical prices are never overwritten.
     * @param batchId The batch identifier.
     * @param newPricePerKg Distributor price per kg (> 0).
     */
    function updateDistributorPrice(
        bytes32 batchId,
        uint256 newPricePerKg
    ) external {
        ProduceBatch storage batch = _getActiveBatchAndOwner(batchId);

        _validateRole(DISTRIBUTOR_ROLE);

        if (batch.status != ProduceStatus.WITH_DISTRIBUTOR) {
            revert InvalidLifecycleTransition(batch.status, ProduceStatus.WITH_DISTRIBUTOR);
        }
        if (newPricePerKg == 0) {
            revert InvalidPrice(newPricePerKg);
        }

        batch.lastUpdatedAt = block.timestamp;

        _addPriceRecord(batchId, newPricePerKg, ProduceStatus.WITH_DISTRIBUTOR);
        _addProvenance(batchId, batch.status, batch.status, msg.sender, msg.sender, newPricePerKg, "Distributor updated wholesale price");
    }

    // ==========================================
    // 4. DISPATCH IN TRANSIT TOWARDS RETAILER
    // ==========================================
    /**
     * @notice Distributor dispatches the batch for transit to an authorized retailer.
     * @param batchId The batch identifier.
     * @param retailer Address of verified retailer holding RETAILER_ROLE.
     */
    function dispatchToRetailer(
        bytes32 batchId,
        address retailer
    ) external {
        ProduceBatch storage batch = _getActiveBatchAndOwner(batchId);

        _validateRole(DISTRIBUTOR_ROLE);

        if (batch.status != ProduceStatus.WITH_DISTRIBUTOR) {
            revert InvalidLifecycleTransition(batch.status, ProduceStatus.IN_TRANSIT);
        }

        _validateRecipient(retailer, RETAILER_ROLE);

        ProduceStatus previousStatus = batch.status;
        batch.status = ProduceStatus.IN_TRANSIT;
        batch.designatedRecipient = retailer;
        batch.lastUpdatedAt = block.timestamp;

        _addProvenance(batchId, previousStatus, ProduceStatus.IN_TRANSIT, msg.sender, retailer, 0, "Batch dispatched in transit towards designated Retailer");

        emit StatusChanged(batchId, previousStatus, ProduceStatus.IN_TRANSIT, msg.sender, block.timestamp);
    }

    // ==========================================
    // 5. RECEIVE BY RETAILER
    // ==========================================
    /**
     * @notice Retailer accepts delivery of a batch currently IN_TRANSIT.
     * @param batchId The batch identifier.
     */
    function receiveProduceByRetailer(
        bytes32 batchId
    ) external {
        ProduceBatch storage batch = _validateActiveBatch(batchId);

        _validateRole(RETAILER_ROLE);

        if (batch.status != ProduceStatus.IN_TRANSIT) {
            revert InvalidLifecycleTransition(batch.status, ProduceStatus.WITH_RETAILER);
        }
        if (batch.designatedRecipient != msg.sender) {
            revert NotDesignatedRecipient(msg.sender, batch.designatedRecipient);
        }

        _executeOwnershipTransfer(
            batchId,
            batch,
            msg.sender,
            ProduceStatus.WITH_RETAILER,
            "Shipment received and verified into Retailer inventory"
        );
    }

    // ==========================================
    // 6. RETAILER PRICE UPDATE
    // ==========================================
    /**
     * @notice Allows the retailer holding the batch to record final shelf price.
     * @param batchId The batch identifier.
     * @param consumerPricePerKg Final retail price per kg (> 0).
     */
    function updateRetailerPrice(
        bytes32 batchId,
        uint256 consumerPricePerKg
    ) external {
        ProduceBatch storage batch = _getActiveBatchAndOwner(batchId);

        _validateRole(RETAILER_ROLE);

        if (batch.status != ProduceStatus.WITH_RETAILER) {
            revert InvalidLifecycleTransition(batch.status, ProduceStatus.WITH_RETAILER);
        }
        if (consumerPricePerKg == 0) {
            revert InvalidPrice(consumerPricePerKg);
        }

        batch.lastUpdatedAt = block.timestamp;

        _addPriceRecord(batchId, consumerPricePerKg, ProduceStatus.WITH_RETAILER);
        _addProvenance(batchId, batch.status, batch.status, msg.sender, msg.sender, consumerPricePerKg, "Retailer established consumer shelf price");
    }

    // ==========================================
    // 7. RECORD FINAL SALE (CONSUMER PURCHASE)
    // ==========================================
    /**
     * @notice Retailer marks the batch as SOLD to consumers.
     * @dev Sets status to terminal state SOLD. No further ownership or price updates can occur.
     * @param batchId The batch identifier.
     */
    function recordSale(
        bytes32 batchId
    ) external {
        ProduceBatch storage batch = _getActiveBatchAndOwner(batchId);

        _validateRole(RETAILER_ROLE);

        if (batch.status != ProduceStatus.WITH_RETAILER) {
            revert InvalidLifecycleTransition(batch.status, ProduceStatus.SOLD);
        }

        ProduceStatus previousStatus = batch.status;
        batch.status = ProduceStatus.SOLD;
        batch.lastUpdatedAt = block.timestamp;

        _addProvenance(batchId, previousStatus, ProduceStatus.SOLD, msg.sender, address(0), 0, "Produce batch sold to final consumer");

        emit StatusChanged(batchId, previousStatus, ProduceStatus.SOLD, msg.sender, block.timestamp);
    }

    // ==========================================
    // 8. UNIFIED OWNERSHIP TRANSFER METHOD
    // ==========================================
    /**
     * @notice Generalized ownership transfer function verifying strict lifecycle ordering.
     * @dev Reverts if the transition violates the business rules.
     * @param batchId The batch identifier.
     * @param recipient The target recipient.
     * @param targetStatus The requested target lifecycle status.
     */
    function transferOwnership(
        bytes32 batchId,
        address recipient,
        ProduceStatus targetStatus
    ) external {
        ProduceBatch storage batch = _getActiveBatchAndOwner(batchId);

        // Validate allowed transitions
        if (batch.status == ProduceStatus.REGISTERED && targetStatus == ProduceStatus.WITH_DISTRIBUTOR) {
            _validateRecipient(recipient, DISTRIBUTOR_ROLE);
        } else if (batch.status == ProduceStatus.WITH_DISTRIBUTOR && targetStatus == ProduceStatus.WITH_RETAILER) {
            _validateRecipient(recipient, RETAILER_ROLE);
        } else {
            revert InvalidLifecycleTransition(batch.status, targetStatus);
        }

        _executeOwnershipTransfer(
            batchId,
            batch,
            recipient,
            targetStatus,
            "Ownership transferred via unified transfer pipeline"
        );
    }

    // ==========================================
    // 9. READ-ONLY INSPECTION FUNCTIONS
    // ==========================================
    /**
     * @notice Checks if a batch ID exists on-chain.
     */
    function batchExists(bytes32 batchId) external view returns (bool) {
        return _batches[batchId].status != ProduceStatus.NONE;
    }

    /**
     * @notice Retrieves batch details.
     */
    function getBatch(bytes32 batchId) external view returns (ProduceBatch memory) {
        _requireBatchExists(batchId);
        return _batches[batchId];
    }

    /**
     * @notice Retrieves current ownership of a batch.
     */
    function getCurrentOwner(bytes32 batchId) external view returns (address) {
        _requireBatchExists(batchId);
        return _batches[batchId].currentOwner;
    }

    /**
     * @notice Retrieves current lifecycle status of a batch.
     */
    function getCurrentStatus(bytes32 batchId) external view returns (ProduceStatus) {
        _requireBatchExists(batchId);
        return _batches[batchId].status;
    }

    /**
     * @notice Checks if a batch is sold (terminal status).
     */
    function isBatchSold(bytes32 batchId) external view returns (bool) {
        _requireBatchExists(batchId);
        return _batches[batchId].status == ProduceStatus.SOLD;
    }

    /**
     * @notice Retrieves the full historical pricing records for a batch.
     */
    function getPriceHistory(bytes32 batchId) external view returns (PriceRecord[] memory) {
        _requireBatchExists(batchId);
        return _priceHistory[batchId];
    }

    /**
     * @notice Retrieves the full provenance trail and supply-chain transaction timeline for a batch.
     */
    function getProvenanceHistory(bytes32 batchId) external view returns (ProvenanceRecord[] memory) {
        _requireBatchExists(batchId);
        return _provenanceHistory[batchId];
    }

    /**
     * @notice Returns total number of registered batches on-chain.
     */
    function getTotalBatches() external view returns (uint256) {
        return _allBatchIds.length;
    }

    /**
     * @notice Returns registered batch ID at index.
     */
    function getBatchIdAtIndex(uint256 index) external view returns (bytes32) {
        require(index < _allBatchIds.length, "Index out of bounds");
        return _allBatchIds[index];
    }
}
