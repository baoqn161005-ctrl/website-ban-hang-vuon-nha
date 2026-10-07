import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Dev: gọi /api và /uploads sẽ được chuyển sang backend (cổng 3000) nên không cần cấu hình CORS
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:3000', '/uploads': 'http://localhost:3000' } }
});
