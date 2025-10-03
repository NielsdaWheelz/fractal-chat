import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { semanticSearch } from "../index.server"

/**
 * Chunks a raw text string into smaller segments for embedding.
 * Uses recursive character text splitting with configurable chunk size and overlap.
 * 
 * @param rawText - The text content to be chunked
 * @returns Array of document objects with pageContent and metadata
 */
export const chunkText = async (rawText: string) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const docs = await splitter.createDocuments([rawText]);
  return docs; // Each doc has { pageContent, metadata }
}

/**
 * Generates embeddings for an array of text chunks using OpenAI's embedding model.
 * Uses text-embedding-3-small with 512 dimensions for efficient semantic search.
 * 
 * @param chunkTexts - Array of text strings to embed
 * @returns Array of embedding vectors (number arrays)
 */
export const generateEmbeddings = async (chunkTexts: string[]) => {
  const { embeddings } = await embedMany({
    maxParallelCalls: 100,
    model: openai.textEmbeddingModel('text-embedding-3-small'),
    values: chunkTexts,
    providerOptions: {
      openai: {
        dimensions: 512,
      },
    },
  })
  return embeddings
};

/**
 * Embeds a query string and searches for semantically similar document chunks.
 * 
 * @param userId - The user ID to scope the search to
 * @param query - The search query text
 * @param topK - Number of top results to return (default: 5)
 * @returns Object containing search results and metadata
 */
export const embedAndSearch = async (userId: string, query: string, topK: number) => {
  const queryEmbeddings = await generateEmbeddings([query]);
  const queryEmbedding = queryEmbeddings[0];

  const matches = await semanticSearch(userId, queryEmbedding, topK);

  return {
    success: true,
    results: matches,
    count: matches.length,
  };
}

