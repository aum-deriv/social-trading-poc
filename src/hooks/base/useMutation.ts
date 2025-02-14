import { useState } from "react";

interface MutationOptions<D> {
    url?: string;
    data?: D;
}

function useMutation<T, D = unknown>(baseUrl: string) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const executeMutation = async (
        method: string,
        options?: MutationOptions<D>
    ) => {
        try {
            setIsLoading(true);
            setError(null);

            const url = options?.url ? `${baseUrl}/${options.url}` : baseUrl;

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: options?.data ? JSON.stringify(options.data) : undefined,
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

    const create = async (options: MutationOptions<D>) => {
        return executeMutation("POST", options);
    };

    const update = async (options: MutationOptions<D>) => {
        return executeMutation("PUT", options);
    };

    const patch = async (options: MutationOptions<D>) => {
        return executeMutation("PATCH", options);
    };

    const remove = async (url?: string) => {
        return executeMutation("DELETE", url ? { url } : undefined);
    };

    return {
        data,
        error,
        isLoading,
        create,
        update,
        patch,
        remove,
    };
}

export default useMutation;
