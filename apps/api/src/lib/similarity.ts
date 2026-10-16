export function cosine(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length) {
    throw new Error(`vector length mismatch: ${a.length} vs ${b.length}`);
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i]!;
    const bi = b[i]!;
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function topK<T>(
  query: readonly number[],
  items: readonly { item: T; embedding: readonly number[] }[],
  k: number,
): { item: T; score: number }[] {
  return items
    .map(({ item, embedding }) => ({ item, score: cosine(query, embedding) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, k);
}
