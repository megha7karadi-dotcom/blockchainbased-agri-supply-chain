import fs from 'fs';
import path from 'path';
import solc from 'solc';

function findImports(importPath) {
  try {
    let fullPath;
    if (importPath.startsWith('@openzeppelin/')) {
      fullPath = path.resolve('node_modules', importPath);
    } else {
      fullPath = path.resolve(importPath);
    }
    return { contents: fs.readFileSync(fullPath, 'utf8') };
  } catch (err) {
    return { error: 'File not found: ' + importPath };
  }
}

export function compileContract() {
  const contractPath = path.resolve('contracts', 'AgriTraceSupplyChain.sol');
  if (!fs.existsSync(contractPath)) {
    throw new Error(`Contract file not found at ${contractPath}`);
  }

  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'contracts/AgriTraceSupplyChain.sol': {
        content: source
      }
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: 'shanghai',
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error(output.errors.map(e => e.formattedMessage || e.message).join('\n'));
      throw new Error('Solidity compilation failed with errors');
    }
  }

  const contract = output.contracts['contracts/AgriTraceSupplyChain.sol']['AgriTraceSupplyChain'];
  const buildDir = path.resolve('contracts', 'build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  const artifact = {
    contractName: 'AgriTraceSupplyChain',
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object
  };

  const outputPath = path.join(buildDir, 'AgriTraceSupplyChain.json');
  fs.writeFileSync(outputPath, JSON.stringify(artifact, null, 2));
  console.log(`[Compile] Successfully compiled AgriTraceSupplyChain.sol -> ${outputPath}`);

  // Also sync to frontend ABI file
  const frontendAbiDir = path.resolve('src', 'lib', 'blockchain');
  if (!fs.existsSync(frontendAbiDir)) {
    fs.mkdirSync(frontendAbiDir, { recursive: true });
  }
  const frontendAbiPath = path.join(frontendAbiDir, 'abi.ts');
  const abiContent = `/**\n * Auto-generated ABI from AgriTraceSupplyChain.sol compilation artifact\n * Do not edit manually\n */\nexport const AGRITRACE_ABI = ${JSON.stringify(artifact.abi, null, 2)} as const;\n\nexport default AGRITRACE_ABI;\n`;
  fs.writeFileSync(frontendAbiPath, abiContent);
  console.log(`[Compile] Synced ABI to frontend -> ${frontendAbiPath}`);

  return artifact;
}

// Run immediately if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  compileContract();
}
