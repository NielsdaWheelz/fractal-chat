import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { semanticSearch } from './search.server';

export const chunkText = async (rawText: string) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const docs = await splitter.createDocuments([rawText]);
  return docs; // Each doc has { pageContent, metadata }
}

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

export const embedAndSearch = async (userId: string, query: string, topK: number, documentIds?: string[]) => {
  const queryEmbeddings = await generateEmbeddings([query]);
  const queryEmbedding = queryEmbeddings[0];

  const matches = await semanticSearch(userId, queryEmbedding, topK, documentIds);

  return {
    success: true,
    results: matches,
    count: matches.length,
  };
}

