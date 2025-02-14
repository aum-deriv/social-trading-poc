import { useQuery } from "../base";
import { DB_BASE_URL } from "./config";

function useQueryDB<T>(path: string, enabled: boolean = true) {
    // Remove leading slash if present
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = `${DB_BASE_URL}/${cleanPath}`;

    return useQuery<T>(url, enabled);
}

export default useQueryDB;
