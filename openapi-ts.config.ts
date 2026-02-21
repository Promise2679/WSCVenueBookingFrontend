import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'openapi.yaml',
  output: 'src/api',
  plugins: [
    { name: '@hey-api/sdk', validator: { request: 'valibot' } },
    { name: 'valibot', responses: false },
    { baseUrl: 'https://127.0.0.1', name: '@hey-api/client-fetch' },
    '@pinia/colada'
  ]
})
