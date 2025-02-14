import { useQuery } from "../base";
import { AI_BASE_URL } from "./config";

interface UseQueryAIOptions {
    enabled?: boolean;
}

function useQueryAI<T>(path: string, options: UseQueryAIOptions = {}) {
    // Remove leading slash if present
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = `${AI_BASE_URL}/${cleanPath}`;

    return useQuery<T>(url, options.enabled);
}

export default useQueryAI;
