import { LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "~/services/auth.server";
import { model } from "~/services/gemini.server";


export const loader = async ({ request }: LoaderFunctionArgs) => {
    await requireAuth(request) as { grantId: string, email: string };

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const content = searchParams.get('content');

    if (!content) {
        return new Response('400 Bad Request - "content" url search param is required', { status: 400 });
    }

    const prompt = `
        - Task: Summarize the extracted email content to give an overview of what this email thread is all about, what is the discussion all about, and list out the key points of the conversation.
        - Format:
            - Return it as a formatted HTML markup. Don't include a tripple backtick \` wrapper, this is not markdown, it'll be rendered in the browser
        - Outline: Make sure it follows this outline:
            <h3>Overview</h3>
            <h3>Key Points</h3>
                <ul>
                    <li><strong>{Key Point}</strong> - {details}</li>
                </ul>
        - Here's the extracted emails in a thread: ${content}
        - Note: You don't need to give it a title heading (like: Email Thread Summary) as I already have that in the frontend, so including this heading title will make it redundant and unncessary.
    `
    const res = await model.generateContent(prompt);
    const emailThreadSummary = res.response.text();

    return { emailThreadSummary };
}
