import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 개발 서버에서 업로드 이미지 요청을 백엔드로 전달
      '/uploads': 'http://localhost:4000',
    },
  },
})
