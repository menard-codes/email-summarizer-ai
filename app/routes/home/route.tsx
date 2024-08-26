import { MetaFunction, LinksFunction } from "@remix-run/node";
import styles from "./home.styles.css?url";
import { Outlet, useLocation } from "@remix-run/react";

export const meta: MetaFunction = () => [
    { title: 'Email Summarizer AI' },
    { name: 'description', content: 'Email Summarizer AI' }
]

export const links: LinksFunction = () => [
    { rel: 'stylesheet', href: styles }
]

export default function Home() {
    const emailThreads = [
        {
            text: 'Thread 1',
            id: 1111
        },
        {
            text: 'Thread 2',
            id: 1112
        },
        {
            text: 'Thread 3',
            id: 1113
        },
    ];
    const user = {
        email: "menard@gmail.com"
    };

    const { pathname } = useLocation();

    return (
        <main>
            <nav>
                <a href="/home">
                    <h1>Email Summarizer</h1>
                </a>
                <p>{user.email}</p>
            </nav>

            <div className="body">
                <aside>
                    <p className="sidebar-label">Email Threads</p>
                    <ul className="threads">
                        {
                            emailThreads.map(thread => (
                                <a href={`/home/thread/${thread.id}`} key={thread.id}>
                                    <li>{thread.text}</li>
                                </a>
                            ))
                        }
                    </ul>
                </aside>
                <div className="content">
                    {
                        pathname === "/home"
                            ? (
                                <div className="thread-template">
                                    <h2>Select an Email Thread</h2>
                                    <p>
                                        Select an email thread from the list on the left to
                                        get the summary and overview of the thread and ask
                                        questions about that thread to get onboarded on the
                                        discussions in no time.
                                    </p>
                                </div>
                            ) : (
                                <Outlet />
                            )
                    }
                </div>
            </div>
        </main>
    )
}
