import { QdrantVectorStore } from "@langchain/qdrant";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

/**
 * Singleton-like helper to get or initialize the Hugging Face Embeddings.
 * Using all-MiniLM-L6-v2: Efficient and free via Hugging Face Inference API.
 */
function getEmbeddings() {
  return new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACE_API_KEY,
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });
}

/**
 * Singleton-like helper to get or initialize the Qdrant Vector Store.
 */
export async function getVectorStore() {
  const embeddings = getEmbeddings();

  return await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: process.env.QDRANT_COLLECTION_NAME || "notebook_lm_clone",
  });
}

/**
 * Helper to initialize a NEW vector store (used during upload).
 */
export async function initVectorStore(docs: any[]) {
  const embeddings = getEmbeddings();

  return await QdrantVectorStore.fromDocuments(docs, embeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: process.env.QDRANT_COLLECTION_NAME || "notebook_lm_clone",
  });
}
