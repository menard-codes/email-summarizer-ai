
import axios from "axios";
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

export async function googleSearch(keywords: string[]) {
    const searchQuery = keywords.join(' ');
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
            key: process.env.GOOGLE_SEARCH_API_KEY,
            cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
            q: searchQuery
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const compiledSearchResults = response.data.items.map((item: any): string => {
        const snippet = item.snippet as string;
        const description = item.metatags["og:description"] as string || '';
        return description ? snippet + '. ' + description : snippet;
    }).join(' ');
    return compiledSearchResults;
}
