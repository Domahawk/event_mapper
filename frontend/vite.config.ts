import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        watch: {
          usePolling: true, // helpful if file changes aren’t detected
        },
        proxy: {
            '/api': {
                target: 'http://www:80',
                changeOrigin: true,
                rewrite: (path: string) => path,
            },
        },
    },
})
