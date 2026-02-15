<template>
  <v-app :theme="theme">
    <v-app-bar elevation="1">
      <v-app-bar-title>まつしげレーティング</v-app-bar-title>
      
      <v-spacer />
      
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ theme === 'dark' ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useAppStore } from '~/stores/app'
import { useTheme } from 'vuetify'

const store = useAppStore()
const vuetifyTheme = useTheme()

const theme = computed(() => store.theme)

const toggleTheme = () => {
  store.toggleTheme()
  vuetifyTheme.global.name.value = store.theme
}

onMounted(() => {
  store.loadPlayerId()
  store.loadTheme()
  store.loadPlayerCache()
  vuetifyTheme.global.name.value = store.theme
})
</script>

<style>
/* ダークモードで非アクティブボタンの視認性を改善 */
.v-theme--dark .v-btn--disabled {
  opacity: 0.45 !important;
}
</style>
