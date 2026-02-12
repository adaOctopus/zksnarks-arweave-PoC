pragma circom 2.1.0;

template AgeVerifier() {
    // Private input
    signal input age;
    
    // Public input (commitment to prevent proof reuse)
    signal input nullifier;
    
    // Public output
    signal output isAdult;
    
    // Constraint: age must be 18 or greater
    component greaterEq = GreaterEqThan(8); // 8 bits = max 255
    greaterEq.in[0] <== age;
    greaterEq.in[1] <== 18;
    
    isAdult <== greaterEq.out;
    
    // Ensure nullifier is used (prevents malleability)
    signal nullifierSquared;
    nullifierSquared <== nullifier * nullifier;
}

component main {public [nullifier]} = AgeVerifier();
