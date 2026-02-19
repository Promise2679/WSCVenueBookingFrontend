import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'openapi.yaml',
  output: 'src/api',
  plugins: [
    { name: '@hey-api/sdk', validator: { request: 'valibot' } },
    { name: 'valibot', responses: false }
  ]
})
