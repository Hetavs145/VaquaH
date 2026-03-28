import { embedText, embedBatch } from './embeddingService.js';

const CHUNK_SIZE = 512;
const CHUNK_OVERLAP = 50;

// In-memory store: array of { text, embedding, category }
let documents = [];

const chunkText = (text, category) => {
  const chunks = [];
  if (text.length <= CHUNK_SIZE) {
    chunks.push({ text, category });
    return chunks;
  }
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push({ text: text.slice(start, end).trim(), category });
    start = end - CHUNK_OVERLAP;
    if (start + CHUNK_OVERLAP >= text.length) break;
  }
  return chunks;
};

const cosineSimilarity = (a, b) => {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // vectors are already normalized
};

export const buildIndex = async (knowledgeBase) => {
  const allChunks = [];
  for (const entry of knowledgeBase) {
    const chunks = chunkText(entry.content, entry.category);
    allChunks.push(...chunks);
  }

  const texts = allChunks.map(c => c.text);
  const embeddings = await embedBatch(texts);

  documents = allChunks.map((chunk, i) => ({
    text: chunk.text,
    category: chunk.category,
    embedding: embeddings[i],
  }));

  console.log(`Vector index built: ${documents.length} chunks from ${knowledgeBase.length} entries.`);
};

export const search = async (query, topK = 5) => {
  if (documents.length === 0) return '';

  const queryEmbedding = await embedText(query);

  const scored = documents.map(doc => ({
    text: doc.text,
    category: doc.category,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  const results = scored.slice(0, topK);
  return results.map(r => r.text).join('\n\n');
};

export const getDocumentCount = () => documents.length;
