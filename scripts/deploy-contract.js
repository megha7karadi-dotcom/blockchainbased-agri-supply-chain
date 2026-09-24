import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import ganache from 'ganache';

async function main() {
  const artifactPath = path.resolve('contracts', 'build', 'AgriTraceSupplyChain.json');
  if (!fs.existsSync(artifactPath)) {
    console.error('Artifact not found. Run "npm run compile:contracts" first.');
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || process.env.VITE_BLOCKCHAIN_RPC_URL;
  let provider;
  let signer;

  if (rpcUrl) {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    if (process.env.PRIVATE_KEY) {
      signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    } else {
      signer = await provider.getSigner(0);
    }
  } else {
    // Local in-memory Ganache test deployment
    console.log('[Deploy] No external RPC specified. Deploying with local development provider...');
    const ganacheProvider = ganache.provider({
      logging: { quiet: true },
      wallet: { totalAccounts: 10 }
    });
    provider = new ethers.BrowserProvider(ganacheProvider);
    signer = await provider.getSigner(0);
  }

  const adminAddress = await signer.getAddress();
  console.log(`[Deploy] Deploying AgriTraceSupplyChain from admin: ${adminAddress}`);

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  const contract = await factory.deploy(adminAddress);
  await contract.waitForDeployment();

  const deployedAddress = await contract.getAddress();
  console.log(`✅ [Deploy] AgriTraceSupplyChain deployed to: ${deployedAddress}`);

  const outDir = path.resolve('contracts');
  fs.writeFileSync(
    path.join(outDir, 'deployedAddress.json'),
    JSON.stringify({
      contractAddress: deployedAddress,
      network: 'local',
      adminAddress,
      deployedAt: new Date().toISOString()
    }, null, 2)
  );

  return deployedAddress;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('[Deploy] Failed:', err);
    process.exit(1);
  });
}

export { main as deployContract };
