import { useMutation } from "../base";
import { DB_BASE_URL } from "./config";

function useMutateDB<T>(basePath: string) {
    // Remove leading slash if present
    const cleanBasePath = basePath.startsWith("/")
        ? basePath.slice(1)
        : basePath;
    const baseUrl = `${DB_BASE_URL}/${cleanBasePath}`;

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

export default useMutateDB;
