import React, { useEffect, useState } from 'react';

interface SummarizerProps {
    content: string;
}

const Summarizer: React.FC<SummarizerProps> = ({ content }) => {
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const summarizeContent = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const searchParam = new URLSearchParams();
            searchParam.set('content', content);
            const result = await fetch(`/thread/summary?${searchParam.toString()}`);
            if (result.ok) {
                const body: { emailThreadSummary: string } = await result.json();
                setSummary(body.emailThreadSummary);
            }
        } catch (err) {
            setError('An error occurred while summarizing the content.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        summarizeContent();
    }, [])

    return (
        <div>
            {
                isLoading
                    ? <h1>Loading...</h1>
                    : summary ? (
                        (
                            <div dangerouslySetInnerHTML={{__html: summary}}>
                            </div>
                        )
                    ) : error && <p className="error">{error}</p>
            }
        </div>
    );
};

export default Summarizer;