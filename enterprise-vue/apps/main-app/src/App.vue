<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAppStore } from '@enterprise/stores'

const appStore = useAppStore()
</script>

<template>
  <div :data-theme="appStore.isDark ? 'dark' : 'light'" class="app-root">
    <RouterView />
  </div>
</template>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app,
.app-root {
  height: 100%;
  min-height: 100vh;
}
</style>
