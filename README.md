# zksnarks-arweave-PoC

![EVM • ZK-SNARKs • Arweave](assets/zkp-arweave-evm-banner.png)


### SNARK flow (high level)

1. You write a Circom circuit that defines inputs and arithmetic constraints.

2. Circom compiles the circuit into R1CS constraints and a WASM program that can compute a witness.

3. You run the WASM with concrete inputs to compute the witness (all signal values).

4. A trusted setup turns the constraint system into proving and verifying keys.

5. The prover uses the witness and proving key to generate a zk-SNARK proof.

6. The proof and public signals are sent to a verifier.

7. The verifier uses the verifying key to cryptographically check that a valid witness exists without recomputing it.


### Commands flow

## zk-SNARK (Groth16) Flow — Terminal Commands

### 1. Compile the circuit
```bash
circom circuit.circom --r1cs --wasm --sym
```

2. (Optional) Inspect constraints
```bash
snarkjs r1cs info circuit.r1cs
```

3. Generate the witness
```bash
snarkjs wtns calculate circuit.wasm input.json witness.wtns
```

4. Powers of tau ceremony / phases

```bash
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="first contribution" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v

```

5. Circuit specific setup
```bash
snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey
```

6. Optional add entropy
```bash
snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey --name="key contribution" -v
```

7. Export vkey
```bash
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json
```

8. Proof generation
```bash
snarkjs groth16 prove circuit_final.zkey witness.wtns proof.json publicSignals.json
```

9. Verify the proof
```bash
snarkjs groth16 verify verification_key.json publicSignals.json proof.json
```

## IMPORTANT STEP FOR ONCHAIN VERIFICATION
#### Using snarkjs auto-generate verifier

```bash
snarkjs zkey export solidityverifier zk-data/FirstCircuit.zkey contracts/verifier.sol
```

---

## Deploy Verifier on Sepolia

### Environment

Create a `.env` in the project root with:

- `PRIVATE_KEY` – your wallet private key (with `0x` prefix). Used to deploy and to run the verify script (same signer).
- `SEPOLIA_RPC_URL` – Sepolia RPC (e.g. Alchemy/Infura).
- `MAINNET_RPC_URL` – optional, for mainnet.

After **Step 2** below, add:

- `VERIFIER_ADDRESS` – the contract address printed by the deploy script.

---

### Steps to check verification on Sepolia

**Run all Hardhat commands from the project root** (`zkp-project/`), **not** from `contracts/` or `scripts/`:

```bash
cd ~/Cardano/cardano-development/quantum/zkp-project
```

**Do not add `"type": "module"` to package.json** — it breaks Hardhat running the TypeScript deploy/verify scripts. The project uses Hardhat 2 with ts-node (CommonJS) for scripts.

---

**Where things go**

- **After compile:** Contract artifacts (ABI, bytecode) are in `artifacts/contracts/`:
  - `artifacts/contracts/verifier.sol/Groth16Verifier.json`
  - `artifacts/contracts/LockDummy.sol/Lock.json`
- **The verifier address is not created by compile.** It is printed only when you **deploy** (Step 1 below). Copy the line `VERIFIER_ADDRESS=0x...` from the deploy script output into your `.env`.

---

**Step 1 – Deploy the verifier (once)**  
This sends the contract to Sepolia and prints the address. Uses your `PRIVATE_KEY`; you pay gas.

```bash
npm run compile
npx hardhat run scripts/deploy-verifier.ts --network sepolia
# or: npm run deploy:verifier
```

The script will print something like:

```
Groth16Verifier deployed to: 0x1234...abcd

Add this line to your .env file:
VERIFIER_ADDRESS=0x1234...abcd
```

Copy that `VERIFIER_ADDRESS=0x...` line into your `.env` file (or add it if it’s not there).

**Step 2 – Generate a proof**  
Creates `zk-data/proof.json` and `zk-data/public.json` (used by the verify script).

```bash
npx ts-node index.ts
```

**Step 3 – Run on-chain verification**  
Uses the **same** `PRIVATE_KEY` signer to connect to Sepolia and call the verifier contract (read-only; no gas spent).

```bash
npx hardhat run scripts/verify-onchain.ts --network sepolia
# or: npm run verify:onchain
```

The script will print:

- `Checking verification from account (your signer): 0x...` – your wallet from `PRIVATE_KEY`
- `Verifier contract: 0x...` – the deployed contract
- `On-chain verification result: true` (or `false`)

So: **deploy first** (Step 1), set `VERIFIER_ADDRESS`, then you can run **Step 2 + Step 3** whenever you want to check a proof on Sepolia. The verify script uses your signer to make the RPC call; `verifyProof` is view-only so it does not send a transaction or spend gas.

For searching the circuit constraints in R1CS format, like a * b = c

run the following once you have compiled and generated --r1cs --wasm --sym files
in zk-data

```bash
snarkjs r1cs print zk-data/BalanceProof.r1cs zk-data/BalanceProof.sym
```