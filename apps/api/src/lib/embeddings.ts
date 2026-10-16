import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers";

const MODEL = "Xenova/all-MiniLM-L6-v2";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;
function getExtractor(): Promise<FeatureExtractionPipeline> {
  extractorPromise ??= pipeline("feature-extraction", MODEL);
  return extractorPromise;
}

export async function embed(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}
