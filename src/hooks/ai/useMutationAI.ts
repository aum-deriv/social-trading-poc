import { useMutation } from "../base";
import { AI_BASE_URL } from "./config";

function useMutationAI<T, D = unknown>(path: string) {
    // Remove leading slash if present
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = `${AI_BASE_URL}/${cleanPath}`;

    return useMutation<T, D>(url);
}

export default useMutationAI;
