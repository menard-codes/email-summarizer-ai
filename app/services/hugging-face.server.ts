import { HfInference } from '@huggingface/inference';

const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;

// Initialize the Hugging Face Inference client
export const huggingFaceInference = new HfInference(HF_API_KEY);