/// <reference path="./snarkjs.d.ts" />
import { readFileSync } from 'fs';
import { join } from 'path';
import { groth16 } from 'snarkjs';
import { randomBytes } from '@noble/ciphers/utils.js';


const wasmFile = join('zk-data', 'FirstCircuit_js', 'FirstCircuit.wasm');
const zkeyFile = join('zk-data', 'FirstCircuit.zkey');
const vKey = JSON.parse(readFileSync(join('zk-data', 'FirstCircuit.vkey'), 'utf8'));

async function main(secret: bigint) {
  // Circuit expects input object { secret: value }; value as decimal string for bigint
  const input = { secret: secret.toString() };
  const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, zkeyFile);
  console.log('Proof:', proof);
  const ok = await groth16.verify(vKey, publicSignals, proof);
  console.log('Proof verified:', ok);
}

// finite field for the circuit
const p = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

// generate a random secret
function randomBigInt32ModP(): bigint {
  const bytes = randomBytes(32)
  
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return BigInt('0x' + hex) % p;
}

const secret = randomBigInt32ModP();
console.log('Secret:', secret);



main(secret).catch(console.error);