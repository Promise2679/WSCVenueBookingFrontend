import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia().use(piniaPluginPersistedstate))
app.use(createVuetify({ icons: { defaultSet: 'mdi' } }))
app.use(router)

app.mount('#app')
