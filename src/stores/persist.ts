import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export const persistConfig = {
  key: (id: string) => `${id}-store`,
  storage: localStorage,
  paths: ['groups', 'friends', 'sessions', 'currentSessionId'],
  serializer: {
    serialize: (value: any) => {
      if (value instanceof Map) {
        return JSON.stringify(Array.from(value.entries()))
      }
      return JSON.stringify(value)
    },
    deserialize: (value: string) => {
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed) && parsed.every(item => Array.isArray(item) && item.length === 2)) {
          return new Map(parsed)
        }
        return parsed
      } catch (e) {
        return value
      }
    }
  }
}
