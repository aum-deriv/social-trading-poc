import { useState } from "react";

function useMutation<T, D = unknown>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const mutate = async (requestData?: D) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: requestData ? JSON.stringify(requestData) : undefined,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { data, error, isLoading, mutate };
}

export default useMutation;
