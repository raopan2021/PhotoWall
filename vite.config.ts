import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

import UnoCSS from 'unocss/vite'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    UnoCSS(),
  ],
  css: {
    postcss: {
      plugins: [
        autoprefixer(), // 启用 Autoprefixer
      ],
    },
  },
  // 添加alias
  resolve: {
    alias: {
      '@': '/src',
    }
  },

  base: '/PhotoWall/', // 设置基础路径为相对路径，用于设置 GitHub Pages
})
