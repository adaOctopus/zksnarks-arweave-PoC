pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template ProofOfCommitment() {
    // private inputs
    signal input secret;
  
    // public inputs
    signal input nonce;
  
    // public outputs
    signal output secretHash;
    signal output authHash;
  
    // computes secretHash as Poseidon(Secret)
    component secretHasher = Poseidon(1);
    secretHasher.inputs <== [secret];
    secretHash <== secretHasher.out;
  
    // computes authHash as Poseidon(Secret, nonce)
    component authHasher = Poseidon(2);
    authHasher.inputs <== [secret, nonce];
    authHash <== authHasher.out;
}

component main {public [nonce]} = ProofOfCommitment();