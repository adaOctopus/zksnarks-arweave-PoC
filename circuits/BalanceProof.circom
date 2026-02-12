pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";



template BalanceProof() {
    signal input balance;
    signal input threshold;
    signal input secret; // For commitment
    // No need to specify public
    // Outputs are public by default
    signal output commitment;
    signal output hasSufficientBalance;
    
    // Prove balance >= threshold
    component check = GreaterEqThan(64);
    check.in[0] <== balance;
    check.in[1] <== threshold;
    hasSufficientBalance <== check.out;
    
    // Create commitment: hash(balance, secret)
    component hasher = Poseidon(2);
    hasher.inputs[0] <== balance;
    hasher.inputs[1] <== secret;
    commitment <== hasher.out;
}

component main = BalanceProof();