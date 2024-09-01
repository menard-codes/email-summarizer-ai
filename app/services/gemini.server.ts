import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_API_KEY as string);

export const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
