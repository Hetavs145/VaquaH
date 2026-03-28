import { pipeline } from '@xenova/transformers';

let embedder = null;

const getEmbedder = async () => {
  if (!embedder) {
    console.log('Loading embedding model (all-MiniLM-L6-v2)...');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding model loaded.');
  }
  return embedder;
};

export const embedText = async (text) => {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};

export const embedBatch = async (texts) => {
  const results = [];
  for (const text of texts) {
    results.push(await embedText(text));
  }
  return results;
};
