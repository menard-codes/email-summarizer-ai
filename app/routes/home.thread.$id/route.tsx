import { LoaderFunctionArgs } from "@remix-run/node";
import styles from "./thread.styles.css?url";
import { requireAuth } from "~/services/auth.server";
import { nylas } from "~/services/nylas.server";
import { Form, useLoaderData, useNavigate, } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

// export const links: LinksFunction = () => [
//     { rel: 'stylesheet', href: styles }
// ]

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { id } = params;

    if (!id) {
        throw new Response('Not Found', { status: 404 });
    }

    const { grantId } = await requireAuth(request) as { grantId: string; email: string; };

    const messages = await nylas.messages.list({
        identifier: grantId,
        queryParams: {
            limit: 10,
            threadId: id,
        }
    });
    
    return {messages};
}

export default function Thread() {
    const { messages } = useLoaderData<typeof loader>();
    const navigate = useNavigate();

    const [emailsViewed, setEmailsViewed] = useState<string[]>([]);

    const emailThreadSummary = `
        Culpa dolor sunt consectetur ut. Adipisicing proident commodo Lorem reprehenderit sint. Ea aliqua qui cupidatat enim sint officia velit adipisicing tempor elit labore do sunt. Quis excepteur laborum velit quis aliquip in ex mollit amet esse quis deserunt. Anim non pariatur voluptate aliquip ad culpa.
    `;
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
        <div className="max-w-6xl mx-auto grid grid-rows-[auto_1fr]">
            <div className="bg-gray-500 text-gray-100 m-4 py-2 px-4 rounded-3xl">
                <button onClick={() => navigate(-1)}>Back</button>
            </div>
            <div className="grid grid-cols-2 w-full mb-4">
                <div className="border-r-2 p-4 grid grid-rows-[auto_auto_1fr]">
                    <div>
                        <h2 className="font-semibold text-xl mb-2">Email Thread Summary</h2>
                        <p className="indent-4">{emailThreadSummary}</p>
                    </div>
                    <hr className="my-4" />
                    <div className="grid grid-rows-[auto_1fr]">
                        <h2 className="font-semibold text-xl mb-2">Email Thread</h2>
                        <div className="relative">
                            <div className="absolute top-0 left-0 w-full h-full overflow-y-auto">
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
                <div className="p-4 pl-0 grid grid-rows-[auto_1fr_auto]">
                    <div className="shadow-md pl-4">
                        <h2 className="font-semibold text-xl mb-2">Chat</h2>
                        <p>Ask anything about this thread.</p>
                    </div>
                    <div className="relative">
                        <div className="absolute w-full h-full overflow-y-auto p-1 pl-4">
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
                    </div>
                    <Form
                        className="pl-4 grid grid-cols-[1fr_auto] gap-4 pt-2"
                    >
                        <input
                            type="text"
                            placeholder="Chat about the thread"
                            className="block w-full border rounded-lg p-2 outline-none"
                        />
                        <button type="submit" className="px-4 border rounded-lg">Send</button>
                    </Form>
                </div>
            </div>
        </div>
    )
}

function HTMLIframe({ htmlContent }: { htmlContent: string }) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (iframeRef.current) {
            const iframe = iframeRef.current;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            iframeDoc?.open();
            iframeDoc?.write(htmlContent);
            iframeDoc?.close();
        }
    }, [htmlContent]);

    return (
        <iframe
            ref={iframeRef}
            title="Email Content"
            className="w-full h-96 border-2"
        />
    )
}
