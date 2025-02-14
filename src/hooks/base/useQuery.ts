import { useState, useEffect } from "react";

function useQuery<T>(url: string, enabled: boolean = true) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        if (!enabled) return;
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [url, enabled]);

    return { data, error, isLoading, refetch: fetchData };
}

export default useQuery;
