import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    envDir: "../",
    server: {
      port: 3000,
      proxy: {
        "/api/v1": "https://react-express-crud-eight.vercel.app/",
      },
    },
    plugins: [react()],
  },
)