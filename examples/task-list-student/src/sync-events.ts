export function dedupeSequences(sequences: number[]): number[] {
  return [...new Set(sequences)].sort((left, right) => left - right);
}
