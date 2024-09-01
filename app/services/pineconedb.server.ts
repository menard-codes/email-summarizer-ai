import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY as string });
export const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME as string);
