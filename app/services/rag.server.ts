
import axios from "axios";
import { chatModel, embeddingModel } from "./gemini.server";
import { pineconeIndex } from "./pineconedb.server";
import { nylas } from "./nylas.server";
import { extractContent, parseAndCleanHtml } from "~/utils/html-preprocess";

async function extractKeywords(query: string) {
    const prompt = `
        Turn the question below that the user has asked into a string of keywords that could be searched on google to effectively find results about travel recommendations.
        Question: ${query}
        Only provide the keywords, nothing else. The keywords must be comma-separated with no spaces.
    `;
    const results = await chatModel.generateContent(prompt);
    const keywords = results.response.text().split(',').map(keyword => keyword.trim());
    return keywords;
}

async function googleSearch(keywords: string[]) {
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
    }).join(' ') as string;
    return compiledSearchResults;
}

async function embedText(text: string) {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
}

export async function indexEmail(email: { subject: string, body: string, id: string }) {
    const text = `Subject: ${email.subject}\nBody: ${email.body}`;
    const vector = await embedText(text);
    await pineconeIndex.upsert([
        {
            id: email.id,
            values: vector,
            metadata: { subject: email.subject }
        }
    ]);
}

async function queryPinecone(query: string, nylasGrantId: string) {
    const queryVector = await embedText(query);
    const queryResponse = await pineconeIndex.query({
        vector: queryVector,
        topK: 5,
        includeMetadata: true
    });

    // Fetch full email content for top matches
    const relevantEmails = await Promise.all(queryResponse.matches.map(async (match) => {
        const message = await nylas.messages.find({ identifier: nylasGrantId, messageId: match.id });
        return message;
    }));

    return relevantEmails.map(email => {
        const body = email.data.body;
        const htmlPre = parseAndCleanHtml(body || '');
        const extractedEmailBody = extractContent(htmlPre || '');
        return `Subject: ${email.data.subject}\nBody: ${extractedEmailBody}`;
    }).join('\n\n');
}

export async function ragChatbot(query: string, nylasGrantId: string) {
    const keywords = await extractKeywords(query);
    const searchResults = await googleSearch(keywords);
    const relevantEmails = await queryPinecone(query, nylasGrantId);
    
    const prompt = `
        Context from relevant emails:
        ${relevantEmails}

        Additional context from web search:
        ${searchResults}

        User Query: ${query}

        Please provide a comprehensive answer to the user's query based on the email context and additional information from the web search.
        If you don't know the answer or don't understand the user query, just say that you don't know or understand and respond accordingly.
        This is better instead of trying to make things up.
    `;

    const result = await chatModel.generateContent(prompt);
    return result.response.text();
}
