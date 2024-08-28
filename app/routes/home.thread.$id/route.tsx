import { LoaderFunctionArgs } from "@remix-run/node";
import styles from "./thread.styles.css?url";
import { requireAuth } from "~/services/auth.server";
import { nylas } from "~/services/nylas.server";
import { Form, useLoaderData, } from "@remix-run/react";

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
            threadId: id
        }
    });
    
    return {messages};
}

export default function Thread() {
    const { messages } = useLoaderData<typeof loader>();

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
        <div className="grid grid-cols-2 max-w-6xl mx-auto py-4">
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
                                    msg.body as string
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
    )
}
