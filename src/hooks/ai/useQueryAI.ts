import { useQuery } from "../base";
import { AI_BASE_URL } from "./config";

function useQueryAI<T>(path: string) {
    // Remove leading slash if present
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = `${AI_BASE_URL}/${cleanPath}`;

    return useQuery<T>(url);
}

export default useQueryAI;
