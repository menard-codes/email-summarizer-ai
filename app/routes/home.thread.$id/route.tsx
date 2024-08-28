import { LinksFunction } from "@remix-run/node";
import styles from "./thread.styles.css?url";
import { useOutletContext } from "@remix-run/react";

export const links: LinksFunction = () => [
    { rel: 'stylesheet', href: styles }
]

export default function Thread() {
    const context = useOutletContext();

    const emailThreadSummary = `
        Culpa dolor sunt consectetur ut. Adipisicing proident commodo Lorem reprehenderit sint. Ea aliqua qui cupidatat enim sint officia velit adipisicing tempor elit labore do sunt. Quis excepteur laborum velit quis aliquip in ex mollit amet esse quis deserunt. Anim non pariatur voluptate aliquip ad culpa.
    `;
    const emails = [
        {
            id: 1000,
            email: 'Cupidatat laboris esse id commodo commodo est est id aliquip.'
        },
        {
            id: 1001,
            email: 'Cupidatat laboris esse id commodo commodo est est id aliquip.'
        },
        {
            id: 1002,
            email: 'Cupidatat laboris esse id commodo commodo est est id aliquip.'
        },
        {
            id: 1003,
            email: 'Cupidatat laboris esse id commodo commodo est est id aliquip.'
        },
        {
            id: 1004,
            email: 'Cupidatat laboris esse id commodo commodo est est id aliquip.'
        },
    ];
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
        <div className="threads-body">
            <div className="threads-section">
                <h2>Email Thread Summary</h2>
                <p>{emailThreadSummary}</p>
                <hr />
                <h2>Email Thread</h2>
                <div className="threads">
                    {
                        emails.map(({email, id}) => (
                            <p key={id} className="email-thread-item">{email}</p>
                        ))
                    }
                </div>
            </div>
            <div className="chat-section">
                <div>
                    <h2>Chat</h2>
                    <p>Ask anything about this thread.</p>
                </div>
                <div className="conversation">
                    {
                        conversation.map(({ id, message, role }) => (
                            <p
                                key={id}
                                className={'chat-bubble ' + (role === 'user' ? 'u-chat-bubble'  : role === 'system' ? 's-chat-bubble'  : '')}
                            >
                                {message}
                            </p>
                        ))
                    }
                </div>
                <div className="chat-form">
                    <input
                        type="text"
                        placeholder="Chat about the thread"
                        className="chat-input"
                    />
                    <button>send</button>
                </div>
            </div>
        </div>
    )
}
