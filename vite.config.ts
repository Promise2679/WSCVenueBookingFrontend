import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://backendsrv:8800'

  return {
    plugins: [vue(), vueDevTools(), vuetify()],
    resolve: { alias: { '@': fileURLToPath(new URL('src', import.meta.url)) } },
    // --- 新增开发服务器配置 ---
    server: { proxy: { '/api': { changeOrigin: true, target: apiProxyTarget } } }
  }
})
