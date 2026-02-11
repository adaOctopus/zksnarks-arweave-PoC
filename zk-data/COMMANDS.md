# ZK proof commands (snarkjs)

## Shared steps

```bash
# Compile circuit
circom circuits/FirstCircuit.circom --r1cs --wasm -o zk-data

# Generate witness (create input.json first, e.g. {"secret": 123})
cd zk-data/FirstCircuit_js
node generate_witness.js FirstCircuit.wasm ../../input.json witness.wtns
cd ../..
```

Download a `.ptau` file (e.g. from Hermez) if you don’t have one.

---

## Groth16

```bash
snarkjs groth16 setup zk-data/FirstCircuit.r1cs <your>.ptau zk-data/FirstCircuit_0000.zkey
snarkjs zkey contribute zk-data/FirstCircuit_0000.zkey zk-data/FirstCircuit_final.zkey --name="my contribution" -e="random text"
snarkjs zkey export verificationkey zk-data/FirstCircuit_final.zkey zk-data/verification_key.json
snarkjs groth16 prove zk-data/FirstCircuit_final.zkey zk-data/FirstCircuit_js/witness.wtns zk-data/proof.json zk-data/public.json
snarkjs groth16 verify zk-data/verification_key.json zk-data/public.json zk-data/proof.json
# Optional Solidity verifier:
snarkjs zkey export solidityverifier zk-data/FirstCircuit_final.zkey ../contracts/Verifier.sol
```

---

## PLONK

```bash
snarkjs plonk setup zk-data/FirstCircuit.r1cs <your>.ptau zk-data/FirstCircuit_plonk.zkey
snarkjs zkey export verificationkey zk-data/FirstCircuit_plonk.zkey zk-data/verification_key_plonk.json
snarkjs plonk prove zk-data/FirstCircuit_plonk.zkey zk-data/FirstCircuit_js/witness.wtns zk-data/proof_plonk.json zk-data/public_plonk.json
snarkjs plonk verify zk-data/verification_key_plonk.json zk-data/public_plonk.json zk-data/proof_plonk.json
```

Replace `<your>.ptau` with your actual ptau filename (e.g. `powersOfTau28_hez_final_12.ptau`).


// Actual example from zk-toolbox lib

PHASE 1

As mentioned in the introduction, zk-SNARKs require a trusted setup, which consists of two phases:

Phase 1: Circuit-independent (global).
Phase 2: Circuit-specific.
We generate a Phase 1 setup supporting up to 
2
12
 constraints, which is sufficient since 
213
∗
2
 constraints is roughly 
2
9

```bash
snarkjs powersoftau new bn128 12 zk-data/pot12_0000.ptau -v
snarkjs powersoftau contribute zk-data/pot12_0000.ptau zk-data/pot12_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 zk-data/pot12_0001.ptau zk-data/pot12_final.ptau -v
```

Now we do a minimal phase 2 setup (for testing purposes)

```bash
snarkjs groth16 setup zk-data/FirstCircuit.r1cs zk-data/pot12_final.ptau zk-data/FirstCircuit.zkey
```
Note here, the prover is two files, the compiled circuit .wasm file in zk-data and the zkey proving key

And for the verifier


```bash
snarkjs zkey export verificationkey zk-data/FirstCircuit.zkey zk-data/FirstCircuit.vkey
```