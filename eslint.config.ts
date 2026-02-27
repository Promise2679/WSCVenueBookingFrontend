import lint from '@promise2/eslint-config'

export default lint({
  ignores: ['src/api'],
  rules: { camelcase: 'off', 'sonarjs/pseudo-random': 'off', 'vue/valid-v-slot': 'off' }
})
