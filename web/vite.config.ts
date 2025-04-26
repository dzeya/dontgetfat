import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({ 
      open: true, 
      gzipSize: true, 
      brotliSize: true, 
      filename: 'stats.html', 
    }),
  ],
  server: { 
    proxy: {
      '/openai': {
        target: 'http://localhost:3000', 
        changeOrigin: true, 
        secure: false,      
      },
      '/image-generation': {
        target: 'http://localhost:3000', 
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
