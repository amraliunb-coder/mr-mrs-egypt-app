import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cast process to any to resolve TS error: Property 'cwd' does not exist on type 'Process'
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Prevents "process is not defined" error in browser
      // CRITICAL FIX: JSON.stringify ensures the API Key is treated as a string, not a variable
      'process.env': {
        API_KEY: JSON.stringify(env.API_KEY)
      }
    }
  }
})
