import type { App } from 'vue'
import EButton from './components/EButton/EButton.vue'
import EPermission from './components/EPermission/EPermission.vue'

const components = { EButton, EPermission }

export function install(app: App): void {
  for (const [name, component] of Object.entries(components)) {
    app.component(name, component)
  }
}
