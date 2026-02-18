import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'http://127.0.0.1:4523/export/openapi/5?version=3.1',
  output: 'src/api',
  plugins: ['@hey-api/client-ofetch', 'valibot', '@pinia/colada']
})
