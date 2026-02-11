import { readFileSync } from 'fs';
import { join } from 'path';
import { groth16 } from 'snarkjs';

const wasmFile = join('zk-data', 'FirstCircuit_js', 'FirstCircuit.wasm');
const zkeyFile = join('zk-data', 'FirstCircuit.zkey');
const vKey = JSON.parse(readFileSync(join('zk-data', 'FirstCircuit.vkey'), 'utf8'));

async function main() {
  const input = { secret: 123 };
  const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, zkeyFile);
  const ok = await groth16.verify(vKey, publicSignals, proof);
  console.log('Proof verified:', ok);
}

main();