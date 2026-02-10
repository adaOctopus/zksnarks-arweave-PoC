This is just some notes, for understanding how circom is basically turned into a Rank-1 constraint system, which is basically a list of linear equations, that represent those constraints.

# High Level

Circom → R1CS → algebraic encoding → cryptographic proof → on-chain verification

R1CS is the bridge; the proof system is what makes that bridge verifiable and zero-knowledge.

The prover:

1. computes the witness (values for all signals)

2. combines it with the proving key

3. produces a zkSNARK proof

The verifier:

1. takes the proof

2. takes the public inputs

3. uses the verifying key

4. runs a small number of pairing checks (very fast, constant size)

R1CS is a **standard, low-level arithmetic representation of a computation**: a list of constraints of the form
*(linear combination of variables) × (linear combination of variables) = (linear combination of variables)*.
Circom converts your circuit into R1CS because zkSNARK proof systems **cannot work with programs or logic directly**—they only know how to prove that such arithmetic constraints are satisfied. The **prover** uses the R1CS plus a witness (all variable values) to generate a proof, and the **verifier** uses the same R1CS (encoded into a verifying key) to check that the proof corresponds to *some* valid witness, without learning it. R1CS is therefore the **interface layer** between your circuit and the cryptography that makes proving and verification possible.

The **witness** is just a vector containing the concrete values of **every signal in the circuit** (inputs, intermediates, outputs), with a fixed order chosen by the compiler. Each R1CS constraint has three vectors **A, B, C** (left, right, output), which are **coefficient selectors** over the witness: taking a dot product with the witness turns each vector into a linear expression. A constraint enforces that the left expression times the right expression equals the output expression, and Circom translates each multiplication in your circuit into exactly one such `(A · w) × (B · w) = (C · w)` equation by choosing the coefficients appropriately.


Actual notes for understanding

```


w = witness vector (all variables in the circuit)

A_i, B_i, C_i = coefficient vectors

⟨A_i, w⟩ = dot product (linear combination)

witness w is basically a vector w = [1, x1, x2, x3, ..., xn]

A_i → left side

B_i → right side

C_i → output side

Each vector defines a linear expression over the witness.

Example linear expression:

⟨A_i, w⟩ = 3*w[2] + 1*w[5] - 7*w[9]

CONCRETE EXAMPLE

Circom code:

c <== a * b;


Assume:

w = [1, a, b, c]


Then Circom generates one constraint:

⟨A, w⟩ = a
⟨B, w⟩ = b
⟨C, w⟩ = c

Vectors:

A = [0, 1, 0, 0]
B = [0, 0, 1, 0]
C = [0, 0, 0, 1]


ANOTHER EXAMPLE

w = [1, a, b, c, d, t1, t2, out]

t1 === a *  b
REMEMBER R1CS is one multiplication PER CONSTRAINT

A, w = a = 0,1,0,0,0,0,0,0

B, w = b = 0,0,1,0,0,0,0,0

C, w = t1 = 0,0,0,0,0,1,0,0

then another constraint

t2 = c *  d

A,w = c
B,w = d
C,w = t2


```

