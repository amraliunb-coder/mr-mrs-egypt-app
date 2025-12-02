import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cast process to any to resolve TS error
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    // Base: './' allows the app to work from any folder (like /wp-content/uploads/...)
    base: './', 
    plugins: [react()],
    define: {
      'process.env': {
        // Keep your API Key fix
        API_KEY: JSON.stringify(env.API_KEY)
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // This ensures CSS is combined into a single file
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          // This forces the main JavaScript file to be named "main.js"
          entryFileNames: 'assets/main.js',
          // This forces the CSS file to be named "style.css" (if possible) or predictable names
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'assets/style.css';
            }
            return 'assets/[name][extname]';
          },
          // This ensures chunk files have simple names
          chunkFileNames: 'assets/[name].js',
        }
      }
    }
  }
})