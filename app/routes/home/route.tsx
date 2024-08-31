import { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData, useLocation, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { requireAuth } from "~/services/auth.server";
import { nylas } from "~/services/nylas.server";
import { decodeString, encodeString, uint8ArrayToUrlSafeBase64, urlSafeBase64ToUint8Array } from "~/utils/encryption-helpers";


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
            pageToken: searchParams.get('pageToken') || '',
            searchQueryNative: searchParams.get('q') || ''
        }
    });
    const cursorsStackEnc = searchParams.get('paginationCursors');
    let cursorStack: string[] = [];
    if (cursorsStackEnc !== null) {
        const recoveredArray = urlSafeBase64ToUint8Array(cursorsStackEnc);
        const decodedString = decodeString(recoveredArray);
        cursorStack = JSON.parse(decodedString);
    }

    return {
        email,
        threads: threads.data.map(({ id, unread, subject, snippet }) => ({ id, unread, subject, snippet })),
        prev: searchParams.get('prevPage') || '',
        current: searchParams.get('pageToken') || '',
        nextPage: threads.nextCursor || '',
        pageNum: Number(searchParams.get('pageNumber')) || 1,
        paginationStack: cursorStack,
        searchQuery: searchParams.get('q') || ''
    };
}

export default function Home() {
    const { email, threads, prev, current, nextPage, pageNum, paginationStack, searchQuery } = useLoaderData<typeof loader>();
    const { pathname, search } = useLocation();
    const navigation = useNavigation();
    const submit = useSubmit();

    const [paginationCursors, setPaginationCursors] = useState<string[]>([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [currentPage, setCurrentPage] = useState('');
    const [prevPage, setPrevPage] = useState('');

    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPaginationCursors(paginationStack);
        setPageNumber(pageNum);
        setCurrentPage(current);
        setPrevPage(prev);
    }, []);

    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.value = searchQuery || '';
        }
    }, [searchQuery]);

    useEffect(() => {
        if (!search) {
            resetQueryParams();
        }
        setPaginationCursors(paginationStack);
        setPageNumber(pageNum);
        setCurrentPage(current);
        setPrevPage(prev);
    }, [search]);

    const resetQueryParams = () => {
        setPaginationCursors([]);
        setPageNumber(1);
        setCurrentPage('');
        setPrevPage('');
    }

    const handlePrevPagination = async () => {
        if (pageNum > 1) {
            const newCurrent = prevPage;
            const newPrev = paginationCursors[paginationCursors.length - 1];
            const newPaginationCursors = paginationCursors.slice(0, paginationCursors.length - 1)
            const newPageNumber = pageNumber - 1;

            await fetchData(newCurrent, newPrev, newPaginationCursors, newPageNumber);

            setPaginationCursors(newPaginationCursors);
            setPrevPage(newPrev)
            setCurrentPage(newCurrent);
            setPageNumber(newPageNumber)
        }
    }

    const handleNextPagination = async () => {
        if (nextPage) {
            const newCurrent = nextPage;
            const newPrev = currentPage;
            const newPaginationCursors = [...paginationCursors, prevPage];
            const newPageNumber = pageNumber + 1;

            await fetchData(newCurrent, newPrev, newPaginationCursors, newPageNumber);

            setPaginationCursors(newPaginationCursors);
            setPrevPage(newPrev);
            setCurrentPage(newCurrent);
            setPageNumber(newPageNumber);
        }
    }

    const fetchData = async (newCurrent: string, newPrev: string, newPaginationCursors: string[], newPageNumber: number) => {
        const searchParams = new URLSearchParams();
        searchParams.set('pageToken', newCurrent);
        if (newPrev !== '') {
            searchParams.set('prevPage', newPrev);
        }
        const encodedArray = encodeString(JSON.stringify(newPaginationCursors));
        const urlSafeString = uint8ArrayToUrlSafeBase64(encodedArray);
        searchParams.set('paginationCursors', urlSafeString);
        searchParams.set('pageNumber', String(newPageNumber));
        searchParams.set('q', searchQuery || '');
        submit(`?${searchParams.toString()}`);
    }

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
                                                ref={searchInputRef}
                                                placeholder="Search Inbox..."
                                                className="block w-full border rounded-lg p-2 outline-none"
                                                defaultValue={searchQuery || ''}
                                            />
                                        </Form>
                                        <div>
                                            <button
                                                disabled={pageNum <= 1 || navigation.state !== "idle"}
                                                onClick={handlePrevPagination}
                                                className="py-2 px-4 bg-amber-500 text-gray-50 rounded-lg"
                                            >
                                                &lt;
                                            </button>
                                            <span className="mx-4 text-xl font-semibold">{pageNumber}</span>
                                            <button
                                                disabled={nextPage === '' || navigation.state !== "idle"}
                                                onClick={handleNextPagination}
                                                className="py-2 px-4 bg-amber-500 text-gray-50 rounded-lg"
                                            >
                                                &gt;
                                            </button>
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
}
