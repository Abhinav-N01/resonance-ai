import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface VectorStoreDB extends DBSchema {
  documents: {
    key: string;
    value: {
      id: string;
      text: string;
      category: string;
      embedding: number[];
      createdAt: number;
    };
    indexes: { 'by-category': string };
  };
}

let dbPromise: Promise<IDBPDatabase<VectorStoreDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<VectorStoreDB>('second-brain-db', 1, {
    upgrade(db) {
      const store = db.createObjectStore('documents', { keyPath: 'id' });
      store.createIndex('by-category', 'category');
    },
  });
}

export function cosineSimilarity(a: number[], b: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function addDocument(text: string, category: string, embedding: number[]) {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.add('documents', {
    id: crypto.randomUUID(),
    text,
    category,
    embedding,
    createdAt: Date.now()
  });
}

export async function searchDocuments(queryEmbedding: number[], topK: number = 5) {
  if (!dbPromise) return [];
  const db = await dbPromise;
  const docs = await db.getAll('documents');
  
  if (!docs || docs.length === 0) return [];

  const scoredDocs = docs.map(doc => ({
    ...doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding)
  }));
  
  return scoredDocs.sort((a, b) => b.score - a.score).slice(0, topK);
}
