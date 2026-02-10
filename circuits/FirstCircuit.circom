pragma circom 2.0.0;

include "./node_modules/circomlib/circuits/poseidon.circom";

template OurFirstProof() {
    signal input secret;
    signal output hash;

    component hasher = Poseidon(1);
    hasher.inputs[0] <== secret;
    hash <== hasher.out;
}

component main = OurFirstProof();