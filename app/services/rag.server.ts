import { chatModel } from "./gemini.server";

export async function extractKeywords(query: string) {
    const prompt = `
        Turn the question below that the user has asked into a string of keywords that could be searched on google to effectively find results about travel recommendations.
        Question: ${query}
        Only provide the keywords, nothing else. The keywords must be comma-separated with no spaces.
    `;
    const results = await chatModel.generateContent(prompt);
    const keywords = results.response.text().split(',').map(keyword => keyword.trim());
    return keywords;
}
