import { describe, it, expect } from "vitest";
import { cosine, topK } from "../src/lib/similarity.js";

describe("cosine", () => {
  it("returns 1 for identical vectors", () => {
    const v = [1, 0, 0];
    expect(cosine(v, v)).toBeCloseTo(1);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosine([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it("returns -1 for opposite vectors", () => {
    expect(cosine([1, 0], [-1, 0])).toBeCloseTo(-1);
  });

  it("returns 0 for zero vector", () => {
    expect(cosine([0, 0], [1, 1])).toBe(0);
  });

  it("throws on length mismatch", () => {
    expect(() => cosine([1, 2], [1, 2, 3])).toThrow("vector length mismatch");
  });
});

describe("topK", () => {
  const items = [
    { item: "a", embedding: [1, 0, 0] },
    { item: "b", embedding: [0, 1, 0] },
    { item: "c", embedding: [0.9, 0.1, 0] },
  ];

  it("returns k best matches sorted by score", () => {
    const results = topK([1, 0, 0], items, 2);
    expect(results).toHaveLength(2);
    expect(results[0]!.item).toBe("a");
    expect(results[1]!.item).toBe("c");
  });

  it("scores are descending", () => {
    const results = topK([1, 0, 0], items, 3);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score);
    }
  });
});
