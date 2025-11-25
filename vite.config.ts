import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cast process to any to resolve TS error
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // CRITICAL FIX: JSON.stringify ensures the API Key is treated as a string
      'process.env': {
        API_KEY: JSON.stringify(env.API_KEY)
      }
    }
  }
})
