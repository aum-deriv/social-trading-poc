import { useMutation } from "../base";
import { AI_BASE_URL } from "./config";

function useMutationAI<T>(path: string) {
    // Remove leading slash if present
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const baseUrl = `${AI_BASE_URL}/${cleanPath}`;

    const { data, error, isLoading, create, update, patch, remove } =
        useMutation<T, T>(baseUrl);

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

export default useMutationAI;
