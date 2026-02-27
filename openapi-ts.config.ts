import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'openapi.yaml',
  output: 'src/api',
  plugins: ['@hey-api/sdk', '@hey-api/client-fetch', '@pinia/colada']
})
