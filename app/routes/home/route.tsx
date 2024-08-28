import { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData, useLocation, useNavigation } from "@remix-run/react";
import { requireAuth } from "~/services/auth.server";
import { nylas } from "~/services/nylas.server";

export const meta: MetaFunction = () => [
    { title: 'Email Summarizer AI' },
    { name: 'description', content: 'Email Summarizer AI' }
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { email, grantId } = await requireAuth(request) as { grantId: string; email: string; };

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    const threads = await nylas.threads.list({
        identifier: grantId,
        queryParams: {
            limit: 10,
            searchQueryNative: searchParams.get('q') || ''
        }
    });

    return { email, threads: threads.data.map(({ id, unread, subject, snippet }) => ({ id, unread, subject, snippet })) };
}

export default function Home() {
    const { email, threads } = useLoaderData<typeof loader>();
    const { pathname } = useLocation();
    const navigation = useNavigation();

    return (
        <main className="h-full grid grid-rows-[auto_1fr]">
            <div className="shadow-md">
                <nav className="flex justify-between items-center p-4 max-w-6xl mx-auto">
                    <Link to="/home" className="hover:underline decoration-wavy text-2xl">
                        <h1 className="font-semibold">Email Summarizer</h1>
                    </Link>
                    <div className="flex items-center gap-x-4">
                        <p>{email}</p>
                        <Form action="/logout" method="post">
                            <button type="submit" className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg">Log Out</button>
                        </Form>
                    </div>
                </nav>
            </div>

            {
                pathname === "/home"
                    ? (
                        <div className="p-4 w-full max-w-6xl mx-auto">
                            <div>
                                <div>
                                    <h2 className="font-semibold text-4xl mb-2">Inbox</h2>
                                    <div className="grid grid-cols-[1fr_auto] gap-4">
                                        <Form action="/home">
                                            <input
                                                type="search"
                                                name="q"
                                                placeholder="Search Inbox..."
                                                className="block w-full border rounded-lg p-2 outline-none"
                                            />
                                        </Form>
                                        <div>
                                            <button className="py-2 px-4 bg-amber-500 text-gray-50 rounded-lg">&lt;</button>
                                            <button className="mx-4 text-xl font-semibold">10</button>
                                            <button className="py-2 px-4 bg-amber-500 text-gray-50 rounded-lg">&gt;</button>
                                        </div>
                                    </div>
                                </div>
                                {
                                    navigation.state === "loading"
                                        ? <h1>Loading...</h1>
                                        : (
                                            threads.map(({ id, unread, subject, snippet }) => (
                                                <Link to={`/home/thread/${id}`} key={id}>
                                                    <div className={`${unread ? 'bg-gray-400' : 'bg-gray-200'} relative flex gap-3 items-center p-4 my-4 text-nowrap overflow-hidden rounded-lg`}>
                                                        <p className={`${unread ? 'font-semibold' : ''}`}>{subject}</p>
                                                        <p className="text-sm italic text-gray-600">{snippet}</p>
        
                                                        <div className={`absolute top-0 right-0 h-full w-48 bg-gradient-to-l ${unread ? 'from-gray-400' : 'from-gray-200'}`}></div>
                                                    </div>
                                                </Link>
                                            ))
                                        )
                                }
                            </div>
                        </div>
                    ) : (
                        <Outlet />
                    )
            }
        </main>
    )

    // const emailThreads = [
    //     {
    //         text: 'Thread 1',
    //         id: 1111
    //     },
    //     {
    //         text: 'Thread 2',
    //         id: 1112
    //     },
    //     {
    //         text: 'Thread 3',
    //         id: 1113
    //     },
    // ];

    // const { pathname } = useLocation();

    // return (
    //     <main>
    //         <nav>
    //             <a href="/home">
    //                 <h1>Email Summarizer</h1>
    //             </a>
    //             <div className="flex items-center gap-x-4">
    //                 <p>{email}</p>
    //                 <Form action="/logout" method="post">
    //                     <button type="submit" className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg">Log Out</button>
    //                 </Form>
    //             </div>
    //         </nav>

    //         <div className="body">
    //             <aside>
    //                 <p className="sidebar-label">Email Threads</p>
    //                 <ul className="threads">
    //                     {
    //                         emailThreads.map(thread => (
    //                             <a href={`/home/thread/${thread.id}`} key={thread.id}>
    //                                 <li>{thread.text}</li>
    //                             </a>
    //                         ))
    //                     }
    //                 </ul>
    //             </aside>
    //             <div className="content">
    //                 {
    //                     pathname === "/home"
    //                         ? (
    //                             <div className="thread-template">
    //                                 <h2>Select an Email Thread</h2>
    //                                 <p>
    //                                     Select an email thread from the list on the left to
    //                                     get the summary and overview of the thread and ask
    //                                     questions about that thread to get onboarded on the
    //                                     discussions in no time.
    //                                 </p>
    //                             </div>
    //                         ) : (
    //                             <Outlet context={{grantId}} />
    //                         )
    //                 }
    //             </div>
    //         </div>
    //     </main>
    // )
}
