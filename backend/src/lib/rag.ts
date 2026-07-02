/**
 * Simple in-memory RAG (Retrieval Augmented Generation) for Praxis.
 * Stores text chunks from past papers and challenges, retrieves relevant ones
 * via keyword matching to provide context for LLM generation.
 */

export interface Chunk {
  id: string;
  text: string;
  source: string; // e.g. 'past_paper', 'challenge'
  metadata: Record<string, unknown>;
}

// In-memory store
const chunks: Chunk[] = [];

/**
 * Add a document chunk to the knowledge store.
 */
export function addChunk(text: string, source: string, metadata: Record<string, unknown> = {}): string {
  const id = `chunk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  chunks.push({ id, text, source, metadata });
  return id;
}

/**
 * Retrieve relevant chunks based on keyword overlap with the query.
 * Simple bag-of-words approach — swap for embeddings in production.
 */
export function retrieveRelevant(query: string, topK = 3): Chunk[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);
  const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'been', 'were', 'what', 'which', 'their', 'about', 'would', 'could', 'there', 'being']);

  const scored = chunks.map(chunk => {
    const chunkText = chunk.text.toLowerCase();
    const matches = queryTerms.filter(t => !stopWords.has(t) && chunkText.includes(t));
    return { chunk, score: matches.length };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.chunk);
}

/**
 * Build a context string from retrieved chunks for LLM prompt injection.
 */
export function buildContext(query: string): string {
  const relevant = retrieveRelevant(query);
  if (relevant.length === 0) return '';

  return relevant.map((chunk, i) =>
    `[Reference ${i + 1}] (${chunk.source}):\n${chunk.text}`
  ).join('\n\n');
}

/**
 * Seed initial knowledge from existing challenge data.
 */
export function seedFromChallenges(challenges: { title: string; type: string; configPayload: Record<string, unknown> }[]) {
  for (const ch of challenges) {
    const text = [
      `Title: ${ch.title}`,
      `Type: ${ch.type}`,
      ch.configPayload.description as string,
      ch.configPayload.initialCode ? `Initial code:\n${ch.configPayload.initialCode}` : '',
      ch.configPayload.transactions ? `Transactions: ${JSON.stringify(ch.configPayload.transactions)}` : ''
    ].filter(Boolean).join('\n');

    addChunk(text, 'challenge', { title: ch.title, type: ch.type });
  }
}
