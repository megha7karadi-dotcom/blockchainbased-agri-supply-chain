/**
 * Auto-generated ABI from AgriTraceSupplyChain.sol compilation artifact
 * Do not edit manually
 */
export const AGRITRACE_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "initialAdmin",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      }
    ],
    "name": "BatchAlreadyExists",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      }
    ],
    "name": "BatchAlreadySold",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      }
    ],
    "name": "BatchNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CannotTransferToSelf",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyBatchId",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyCropName",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyOriginInfo",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "enum AgriTraceSupplyChain.ProduceStatus",
        "name": "currentStatus",
        "type": "uint8"
      },
      {
        "internalType": "enum AgriTraceSupplyChain.ProduceStatus",
        "name": "targetStatus",
        "type": "uint8"
      }
    ],
    "name": "InvalidLifecycleTransition",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "InvalidPrice",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidQualityGrade",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "quantity",
        "type": "uint256"
      }
    ],
    "name": "InvalidQuantity",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "InvalidRecipient",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "currentOwner",
        "type": "address"
      }
    ],
    "name": "NotCurrentOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "designatedRecipient",
        "type": "address"
      }
    ],
    "name": "NotDesignatedRecipient",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "requiredRole",
        "type": "bytes32"
      }
    ],
    "name": "RecipientMissingRole",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "requiredRole",
        "type": "bytes32"
      }
    ],
    "name": "UnauthorizedCaller",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum AgriTraceSupplyChain.ProduceStatus",
        "name": "newStatus",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "updatedBy",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "enum AgriTraceSupplyChain.ProduceStatus",
        "name": "stage",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "pricePerKg",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "PriceUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "farmer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "cropName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "quantityKg",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum AgriTraceSupplyChain.QualityGrade",
        "name": "qualityGrade",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "initialPricePerKg",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "originHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ProduceRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "enum AgriTraceSupplyChain.ProduceStatus",
        "name": "previousStatus",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "enum AgriTraceSupplyChain.ProduceStatus",
        "name": "newStatus",
        "type": "uint8"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "triggeredBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "StatusChanged",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DISTRIBUTOR_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "FARMER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "RETAILER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      }
    ],
    "name": "batchExists",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "retailer",
        "type": "address"
      }
    ],
    "name": "dispatchToRetailer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      }
    ],
    "name": "getBatch",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "batchId",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "cropName",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "quantityKg",
            "type": "uint256"
          },
          {
            "internalType": "enum AgriTraceSupplyChain.QualityGrade",
            "name": "qualityGrade",
            "type": "uint8"
          },
          {
            "internalType": "bytes32",
            "name": "originHash",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "currentOwner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "farmer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "designatedRecipient",
            "type": "address"
          },
          {
            "internalType": "enum AgriTraceSupplyChain.ProduceStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastUpdatedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct AgriTraceSupplyChain.ProduceBatch",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getBatchIdAtIndex",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      }
    ],
    "name": "getCurrentOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      }
    ],
    "name": "getCurrentStatus",
    "outputs": [
      {
        "internalType": "enum AgriTraceSupplyChain.ProduceStatus",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      }
    ],
    "name": "getPriceHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "pricePerKg",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "setBy",
            "type": "address"
          },
          {
            "internalType": "enum AgriTraceSupplyChain.ProduceStatus",
            "name": "stage",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct AgriTraceSupplyChain.PriceRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      }
    ],
    "name": "getProvenanceHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "enum AgriTraceSupplyChain.ProduceStatus",
            "name": "fromStatus",
            "type": "uint8"
          },
          {
            "internalType": "enum AgriTraceSupplyChain.ProduceStatus",
            "name": "toStatus",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "actor",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "fromOwner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "toOwner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "priceAtStep",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "remarks",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct AgriTraceSupplyChain.ProvenanceRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalBatches",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      }
    ],
    "name": "isBatchSold",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      }
    ],
    "name": "receiveProduceByRetailer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      }
    ],
    "name": "recordSale",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "cropName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "quantityKg",
        "type": "uint256"
      },
      {
        "internalType": "enum AgriTraceSupplyChain.QualityGrade",
        "name": "qualityGrade",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "initialPricePerKg",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "originHash",
        "type": "bytes32"
      }
    ],
    "name": "registerProduce",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "enum AgriTraceSupplyChain.ProduceStatus",
        "name": "targetStatus",
        "type": "uint8"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "distributor",
        "type": "address"
      }
    ],
    "name": "transferToDistributor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "newPricePerKg",
        "type": "uint256"
      }
    ],
    "name": "updateDistributorPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "batchId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "consumerPricePerKg",
        "type": "uint256"
      }
    ],
    "name": "updateRetailerPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export default AGRITRACE_ABI;
