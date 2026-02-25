import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'openapi.yaml',
  output: 'src/api',
  plugins: [
    '@hey-api/sdk',
    { baseUrl: 'http://127.0.0.1:4523/m1/7792878-7539603-default', name: '@hey-api/client-fetch' },
    '@pinia/colada'
  ]
})
