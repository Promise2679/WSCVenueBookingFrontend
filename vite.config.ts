import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), vuetify()],
  resolve: { alias: { '@': fileURLToPath(new URL('src', import.meta.url)) } },
  server: { proxy: { '/api': { changeOrigin: true, target: 'http://154.64.230.227:8800' } } }
})
