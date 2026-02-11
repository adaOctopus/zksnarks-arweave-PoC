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

Commands flow.

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

