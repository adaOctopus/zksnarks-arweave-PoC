/**
 * Calls the deployed Groth16Verifier.verifyProof() with proof and public signals.
 * Requires: VERIFIER_ADDRESS in .env, and proof.json + public.json in zk-data/
 * (Generate them by running: node index.ts or snarkjs groth16 prove ...)
 * Usage: npx hardhat run scripts/verify-onchain.ts --network sepolia
 */
import hre from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

function toBigInt(x: string | number): bigint {
  return typeof x === "string" ? BigInt(x) : BigInt(x);
}

function proofToCalldata(proof: { pi_a: string[]; pi_b: string[][]; pi_c: string[] }, publicSignals: string[]) {
  const pA = [toBigInt(proof.pi_a[0]), toBigInt(proof.pi_a[1])] as const;
  const pB = [
    [toBigInt(proof.pi_b[0][1]), toBigInt(proof.pi_b[0][0])],
    [toBigInt(proof.pi_b[1][1]), toBigInt(proof.pi_b[1][0])],
  ] as const;
  const pC = [toBigInt(proof.pi_c[0]), toBigInt(proof.pi_c[1])] as const;
  const pubSignals = [toBigInt(publicSignals[0])] as const;
  return { pA, pB, pC, pubSignals };
}

async function main() {
  const verifierAddress = process.env.VERIFIER_ADDRESS;
  if (!verifierAddress) {
    throw new Error("Set VERIFIER_ADDRESS in .env (e.g. the address from deploy-verifier)");
  }

  const proofPath = join("zk-data", "proof.json");
  const publicPath = join("zk-data", "public.json");
  const proof = JSON.parse(readFileSync(proofPath, "utf8"));
  const publicSignals = JSON.parse(readFileSync(publicPath, "utf8"));

  const { pA, pB, pC, pubSignals } = proofToCalldata(proof, publicSignals);

  const ethers = (hre as unknown as { ethers: { getSigners(): Promise<{ address: string }[]>; getContractAt(name: string, address: string, signer?: { address: string }): Promise<{ verifyProof(...args: unknown[]): Promise<boolean> }> } }).ethers;
  const [signer] = await ethers.getSigners();
  console.log("Checking verification from account (your signer):", signer.address);
  console.log("Verifier contract:", verifierAddress);

  const verifier = await ethers.getContractAt("Groth16Verifier", verifierAddress, signer);
  const ok = await verifier.verifyProof(pA, pB, pC, pubSignals);
  console.log("On-chain verification result:", ok);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
