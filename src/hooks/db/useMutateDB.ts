import { useMutation } from "../base";
import { DB_BASE_URL } from "./config";

function useMutateDB<T, D = unknown>(path: string) {
    // Remove leading slash if present
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = `${DB_BASE_URL}/${cleanPath}`;

    return useMutation<T, D>(url);
}

export default useMutateDB;
