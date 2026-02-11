declare module 'snarkjs' {
  export const groth16: {
    fullProve(
      input: object,
      wasmFile: string,
      zkeyFile: string
    ): Promise<{ proof: object; publicSignals: string[] }>;
    verify(
      vKey: object,
      publicSignals: string[],
      proof: object
    ): Promise<boolean>;
  };
}
