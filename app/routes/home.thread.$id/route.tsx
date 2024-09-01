import { LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "~/services/auth.server";
import { nylas } from "~/services/nylas.server";
import { Form, useLoaderData, useNavigate, } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { extractContent, parseAndCleanHtml } from "~/utils/html-preprocess";
import styles from "./thread.styles.css?url";
import { LinksFunction } from "@remix-run/react/dist/routeModules";
import Summarizer from "~/components/summarizer";


export const links: LinksFunction = () => [
    { rel: "stylesheet", href: styles }
]

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { id } = params;

    if (!id) {
        throw new Response('Not Found', { status: 404 });
    }

    const { grantId } = await requireAuth(request) as { grantId: string; email: string; };

    const messages = await nylas.messages.list({
        identifier: grantId,
        queryParams: {
            threadId: id,
        }
    });

    // set message as read
    await nylas.threads.update({
        identifier: grantId,
        threadId: id,
        requestBody: {
            unread: false
        }
    });

    const htmlPre = messages.data[0].body ? parseAndCleanHtml(messages.data[0].body) : '';
    const extractedEmailThread = htmlPre ? extractContent(htmlPre) : '';

    return { messages, extractedEmailThread }
}

export default function Thread() {
    // const { messages, emailThreadSummary } = useLoaderData<typeof loader>();
    const { messages, extractedEmailThread } = useLoaderData<typeof loader>();
    const navigate = useNavigate();

    // const [threadsContent, setThreadsContent] = useState([]);
    const [showAIChat, setShowAIChat] = useState(true);

    const [emailsViewed, setEmailsViewed] = useState<string[]>([]);
    const conversation = [
        {
            id: 100,
            message: 'Lorem ipsum?',
            role: 'user'
        },
        {
            id: 101,
            message: 'Lorem ipsum dolor sit amet consectetur Lorem ipsum dolor sit amet consectetur',
            role: 'system'
        },
    ];

    return (
        <>
            <div className="w-full max-w-6xl mx-auto grid grid-rows-[auto_1fr]">
                <div className="bg-gray-500 text-gray-100 m-4 py-2 px-4 rounded-3xl">
                    <button onClick={() => navigate(-1)}>Back</button>
                </div>
                <div className="p-4">
                    <div id="summary-container">
                        <h2 className="font-semibold text-xl mb-2">Conversation Summary</h2>
                        {/* <div dangerouslySetInnerHTML={{ __html: emailThreadSummary }}></div> */}
                        {/* <Summarizer
                            content={extractedEmailThread}
                        /> */}
                    </div>
                    <hr className="my-4" />
                    <div>
                        <h2 className="font-semibold text-xl mb-2">Email Thread</h2>
                        <div>
                            {
                                messages.data.map(msg => (
                                    <div key={msg.id} className="mb-4 border-b-2 p-2">
                                        <h3 className="text-base font-semibold">{msg.subject}</h3>
                                        <div className="italic text-sm text-gray-500">
                                            <p>
                                                From:{' '}
                                                {msg.from?.map(sender => sender.email).join(', ')}
                                            </p>
                                            <p>{(new Date(msg.date * 1000)).toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => setEmailsViewed(emailIds => {
                                                return emailsViewed.includes(msg.id)
                                                    ? emailsViewed.filter(emailId => emailId !== msg.id)
                                                    : [...emailIds, msg.id]
                                            })}
                                        >
                                            {emailsViewed.includes(msg.id) ? 'Hide' : 'Show'}
                                        </button>
                                        {
                                            emailsViewed.includes(msg.id)
                                                ? <HTMLIframe
                                                    htmlContent={msg.body || ''}
                                                />
                                                : ''
                                        }
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="fixed right-[10%] bottom-0 w-[500px] max-h-4/6 border bg-white grid grid-rows-[auto_1fr]">
                    <div className="shadow-md py-2 px-3 relative">
                        <h2 className="font-semibold text-xl">Chat</h2>
                        <p>Ask anything about this thread.</p>
                        <button
                            onClick={() => setShowAIChat(isShown => !isShown)}
                            className="absolute top-0 right-0 px-2 py-1 border rounded"
                        >
                            {showAIChat ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    {
                        showAIChat && (
                            <div className="min-h-[500px] grid grid-rows-[1fr_auto]">
                                <div className="overflow-y-auto p-4">
                                    {
                                        conversation.map(({ id, message, role }) => (
                                            <p
                                                key={id}
                                                className={`w-fit max-w-[70%] my-4 p-4 rounded-2xl ${(role === 'user' ? 'bg-gray-800 text-gray-200 ml-auto'  : role === 'system' ? 'bg-gray-400 mr-auto'  : '')}`}
                                            >
                                                {message}
                                            </p>
                                        ))
                                    }
                                </div>
                                <Form
                                    className="px-4 py-2 grid grid-cols-[1fr_auto] gap-4 pt-2"
                                >
                                    <input
                                        type="text"
                                        placeholder="Chat about the thread"
                                        className="block w-full border rounded-lg p-2 outline-none"
                                    />
                                    <button type="submit" className="px-4 border rounded-lg">Send</button>
                                </Form>
                            </div>
                        )
                    }
                </div>
        </>
    )
}

function HTMLIframe({ htmlContent }: { htmlContent: string }) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (iframeRef.current) {
            const iframe = iframeRef.current;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

            if (iframeDoc) {
                iframeDoc.open();
                iframeDoc.write(htmlContent);
                iframeDoc.close();

                // Remove unwanted elements after the content is loaded
                const removeUnwantedElements = () => {
                    // Remove .gmail_quote elements
                    const gmailQuotes = iframeDoc.querySelectorAll('.gmail_quote');
                    const xGmailQuotes = iframeDoc.querySelectorAll('.x_gmail_quote');
                    gmailQuotes.forEach(element => element.remove());
                    xGmailQuotes.forEach(element => element.remove());

                    // Remove #appendonsend and its succeeding siblings
                    const appendonsend = iframeDoc.querySelector('#appendonsend');
                    if (appendonsend) {
                        let currentElement: Element | null = appendonsend;
                        while (currentElement) {
                            const nextElement: Element | null = currentElement.nextElementSibling;
                            currentElement.remove();
                            currentElement = nextElement;
                        }
                    }
                };

                // Use setTimeout to ensure the content is fully loaded
                setTimeout(removeUnwantedElements, 0);
            }
        }
    }, [htmlContent]);

    return (
        <iframe
            ref={iframeRef}
            title="Email Content"
            className="block w-full h-64 border-2"
        />
    );
}
