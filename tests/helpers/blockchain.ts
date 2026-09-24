import fs from 'fs';
import path from 'path';
import ganache from 'ganache';
import { ethers, Contract, JsonRpcSigner, BrowserProvider, Interface } from 'ethers';
import assert from 'node:assert/strict';
import { compileContract } from '../../scripts/compile-contract.js';

export interface TestAccounts {
  admin: JsonRpcSigner;
  farmer: JsonRpcSigner;
  distributor: JsonRpcSigner;
  retailer: JsonRpcSigner;
  consumer: JsonRpcSigner;
  unauthorizedUser: JsonRpcSigner;
  otherDistributor: JsonRpcSigner;
  otherRetailer: JsonRpcSigner;
}

export interface TestEnv {
  provider: BrowserProvider;
  contract: any;
  contractInterface: Interface;
  accounts: TestAccounts;
  roles: {
    DEFAULT_ADMIN_ROLE: string;
    FARMER_ROLE: string;
    DISTRIBUTOR_ROLE: string;
    RETAILER_ROLE: string;
  };
}

export function loadOrCompileArtifact() {
  const artifactPath = path.resolve('contracts', 'build', 'AgriTraceSupplyChain.json');
  if (!fs.existsSync(artifactPath)) {
    return compileContract();
  }
  return JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
}

export async function setupTestEnvironment(): Promise<TestEnv> {
  const artifact = loadOrCompileArtifact();
  const provider = new ethers.BrowserProvider(
    ganache.provider({
      logging: { quiet: true },
      wallet: { totalAccounts: 10 }
    })
  );

  const signers = await Promise.all(
    Array.from({ length: 8 }, (_, i) => provider.getSigner(i))
  );

  const accounts: TestAccounts = {
    admin: signers[0],
    farmer: signers[1],
    distributor: signers[2],
    retailer: signers[3],
    consumer: signers[4],
    unauthorizedUser: signers[5],
    otherDistributor: signers[6],
    otherRetailer: signers[7],
  };

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    accounts.admin
  );

  const contract: any = await factory.deploy(await accounts.admin.getAddress());
  await contract.waitForDeployment();

  const contractInterface = new ethers.Interface(artifact.abi);

  const roles = {
    DEFAULT_ADMIN_ROLE: await contract.DEFAULT_ADMIN_ROLE(),
    FARMER_ROLE: await contract.FARMER_ROLE(),
    DISTRIBUTOR_ROLE: await contract.DISTRIBUTOR_ROLE(),
    RETAILER_ROLE: await contract.RETAILER_ROLE(),
  };

  // Grant roles to respective test accounts
  await (await contract.grantRole(roles.FARMER_ROLE, await accounts.farmer.getAddress())).wait();
  await (await contract.grantRole(roles.DISTRIBUTOR_ROLE, await accounts.distributor.getAddress())).wait();
  await (await contract.grantRole(roles.RETAILER_ROLE, await accounts.retailer.getAddress())).wait();
  await (await contract.grantRole(roles.DISTRIBUTOR_ROLE, await accounts.otherDistributor.getAddress())).wait();
  await (await contract.grantRole(roles.RETAILER_ROLE, await accounts.otherRetailer.getAddress())).wait();

  return {
    provider,
    contract,
    contractInterface,
    accounts,
    roles,
  };
}

export function extractRevertData(err: any): string | null {
  if (!err) return null;
  if (typeof err.data === 'string') return err.data;
  if (err.data?.result && typeof err.data.result === 'string') return err.data.result;
  if (err.info?.error?.data?.result && typeof err.info.error.data.result === 'string') return err.info.error.data.result;
  if (err.info?.error?.data && typeof err.info.error.data === 'string') return err.info.error.data;
  if (err.error?.data?.result && typeof err.error.data.result === 'string') return err.error.data.result;
  if (err.error?.data && typeof err.error.data === 'string') return err.error.data;
  return null;
}

export async function expectCustomError(
  action: Promise<any>,
  expectedErrorName: string,
  contractInterface: Interface,
  assertArgs?: (args: any) => void
): Promise<void> {
  try {
    const result = await action;
    if (result && typeof result.wait === 'function') {
      await result.wait();
    }
    assert.fail(`Expected transaction to revert with custom error ${expectedErrorName}, but it succeeded`);
  } catch (err: any) {
    if (err.message && err.message.startsWith('Expected transaction to revert')) {
      throw err;
    }

    const data = extractRevertData(err);
    if (!data) {
      // If error message already contains parsed error
      if (err.message && err.message.includes(expectedErrorName)) {
        return;
      }
      assert.fail(`Transaction reverted, but could not extract error data. Raw message: ${err.message}`);
    }

    let parsed = null;
    try {
      parsed = contractInterface.parseError(data);
    } catch (parseErr: any) {
      // Try parsing OpenZeppelin AccessControl standard errors
      try {
        const ozInterface = new ethers.Interface([
          'error AccessControlUnauthorizedAccount(address account, bytes32 neededRole)',
          'error AccessControlBadConfirmation()'
        ]);
        parsed = ozInterface.parseError(data);
      } catch {
        assert.fail(`Failed to parse revert data "${data}" with interface: ${parseErr.message}`);
      }
    }

    assert.ok(parsed, `Revert data could not be parsed as a custom error`);
    const argsString = JSON.stringify(parsed.args, (_, v) => typeof v === 'bigint' ? v.toString() : v);
    assert.equal(
      parsed.name,
      expectedErrorName,
      `Expected error ${expectedErrorName}, but received ${parsed.name} with args: ${argsString}`
    );

    if (assertArgs) {
      assertArgs(parsed.args);
    }
  }
}

export function parseEvents(receipt: any, contractInterface: Interface): any[] {
  const events: any[] = [];
  if (!receipt || !receipt.logs) return events;
  for (const log of receipt.logs) {
    try {
      const parsed = contractInterface.parseLog(log);
      if (parsed) {
        events.push(parsed);
      }
    } catch {
      // ignore unparsed logs
    }
  }
  return events;
}

export function findEvent(receipt: any, contractInterface: Interface, eventName: string): any {
  const events = parseEvents(receipt, contractInterface);
  const found = events.find((e) => e.name === eventName);
  assert.ok(found, `Expected event ${eventName} to be emitted in transaction logs`);
  return found;
}
