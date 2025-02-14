import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@types": path.resolve(__dirname, "./src/types"),
            "@components": path.resolve(__dirname, "./src/components"),
            "@modules": path.resolve(__dirname, "./src/modules"),
            "@pages": path.resolve(__dirname, "./src/pages"),
            "@utils": path.resolve(__dirname, "./src/utils"),
            "@constants": path.resolve(__dirname, "./src/constants"),
            "@layouts": path.resolve(__dirname, "./src/layouts"),
            "@hooks": path.resolve(__dirname, "./src/hooks"),
        },
    },
});
