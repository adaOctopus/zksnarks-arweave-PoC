# ZKey, Verifier Contract, and Circuit Dependencies

## Short Answer

- **Prover and verifier ARE circuit-dependent**
- **Generate zkey ONCE per circuit** (after trusted setup)
- **Generate verifier contract ONCE per circuit** (from that zkey)
- **Reuse the SAME zkey** to generate many proofs
- **Reuse the SAME verifier contract** to verify them
- **Only change zkey + verifier if you CHANGE the circuit**

---

## Detailed Explanation

### What Depends on What

| Thing | Depends on | When You Generate It | How Often |
|-------|------------|----------------------|-----------|
| **zkey** (proving key) | Circuit (R1CS) + trusted setup (tau) | Once, after trusted setup | Once per circuit |
| **Verifier contract** | Verification key (from same zkey) | Once, from zkey | Once per circuit |
| **Proof** (π_a, π_b, π_c) | Witness + proving key (from zkey) | Every time you prove | Many times (reuse same zkey) |
| **Verification** | Proof + verifier contract | Every time you verify | Many times (reuse same contract) |

---

## Workflow

### Step 1: Circuit → zkey (ONCE)

```bash
# Compile circuit
circom MyCircuit.circom --r1cs --wasm

# Trusted setup (once per circuit)
snarkjs powersoftau new bn128 12 pot12_0000.ptau
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau

# Generate zkey (proving key) - ONCE
snarkjs groth16 setup MyCircuit.r1cs pot12_final.ptau MyCircuit.zkey
```

This creates `MyCircuit.zkey` — the proving key for this circuit. **Keep it, you'll reuse it.**

---

### Step 2: zkey → Verifier Contract (ONCE)

```bash
# Export verification key
snarkjs zkey export verificationkey MyCircuit.zkey MyCircuit.vkey

# Generate Solidity verifier contract - ONCE
snarkjs zkey export solidityverifier MyCircuit.zkey contracts/MyCircuitVerifier.sol
```

This creates the verifier contract. **Deploy it once, reuse it.**

---

### Step 3: Generate Proofs (MANY TIMES, SAME zkey)

```bash
# Generate witness
node generate_witness.js MyCircuit.wasm input1.json witness1.wtns

# Generate proof - uses SAME zkey
snarkjs groth16 prove MyCircuit.zkey witness1.wtns proof1.json public1.json

# Generate another proof with different inputs - SAME zkey
node generate_witness.js MyCircuit.wasm input2.json witness2.wtns
snarkjs groth16 prove MyCircuit.zkey witness2.wtns proof2.json public2.json
```

**Same zkey, different proofs** (different inputs → different witnesses → different proofs).

---

### Step 4: Verify Proofs (MANY TIMES, SAME Verifier Contract)

```bash
# Verify proof1 - uses SAME verifier contract
snarkjs groth16 verify MyCircuit.vkey public1.json proof1.json

# Verify proof2 - SAME verifier contract
snarkjs groth16 verify MyCircuit.vkey public2.json proof2.json
```

On-chain: deploy verifier contract **once**, then call `verifyProof` **many times** with different proofs.

---

## When You Need a NEW zkey

**Only if you CHANGE the circuit:**

```
Change circuit → Recompile → New R1CS → New trusted setup → New zkey → New verifier contract
```

Examples:
- Change constraints → new zkey
- Add/remove inputs → new zkey  
- Change output → new zkey

**Same circuit, different inputs** → same zkey, same verifier contract.

---

## Why This Works

- **zkey** encodes the **circuit structure** (polynomials evaluated at τ)
- **Verifier contract** encodes the **verification key** (also from same circuit + τ)
- **Changing inputs** changes the **witness** and **proof**, but the **circuit structure** stays the same, so same zkey + verifier still work

---

## Summary

- **Prover and verifier ARE circuit-dependent**
- **Generate zkey ONCE per circuit** (after trusted setup)
- **Generate verifier contract ONCE per circuit** (from that zkey)
- **Reuse SAME zkey** for all proofs from that circuit
- **Reuse SAME verifier contract** for all verifications
- **Only generate new zkey + verifier if you CHANGE the circuit**

In your project:
- `FirstCircuit.zkey` → use for **all proofs** from `FirstCircuit.circom`
- `verifier.sol` → deploy **once**, use to verify **all proofs** from `FirstCircuit.circom`
- If you change `FirstCircuit.circom` → need **new zkey + new verifier contract**
