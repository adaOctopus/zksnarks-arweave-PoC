/**
 * Deploys the Groth16Verifier contract to the configured network (e.g. Sepolia).
 * Usage: npx hardhat run scripts/deploy-verifier.ts --network sepolia
 */
import hre from "hardhat";

async function main() {
  const ethers = (hre as unknown as { ethers: { getSigners(): Promise<{ address: string }[]>; getContractFactory(name: string): Promise<{ deploy(): Promise<{ waitForDeployment(): Promise<unknown>; getAddress(): Promise<string> }> }> } }).ethers;
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Groth16Verifier with account:", deployer.address);

  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const address = await verifier.getAddress();

  console.log("");
  console.log("Groth16Verifier deployed to:", address);
  console.log("");
  console.log("Add this line to your .env file:");
  console.log("VERIFIER_ADDRESS=" + address);
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
