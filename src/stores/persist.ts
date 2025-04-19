import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export const persistConfig = {
  key: (id: string) => `${id}-store`,
  storage: localStorage,
  paths: ['groups', 'friends', 'sessions', 'currentSessionId']
}
