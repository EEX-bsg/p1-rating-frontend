import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    playerId: null as string | null,
    theme: 'dark' as 'dark' | 'light',
    playerCache: [] as string[],
    playerCacheTimestamp: null as number | null,
    metaCache: null as any,
    metaCacheTimestamp: null as number | null,
    lastDbUpdate: null as string | null,
    lastFetchTime: null as number | null,
    isLoading: false,
    cooldownUntil: null as number | null
  }),

  getters: {
    isPlayerSet: (state) => !!state.playerId,
    canRefresh: (state) => {
      if (!state.cooldownUntil) return true
      return Date.now() >= state.cooldownUntil
    },
    isCacheValid: (state) => {
      if (!state.playerCacheTimestamp) return false
      const TTL = 1000 * 60 * 60 // 1時間
      return Date.now() - state.playerCacheTimestamp < TTL
    }
  },

  actions: {
    setPlayerId(id: string) {
      this.playerId = id
      if (process.client) {
        localStorage.setItem('playerId', id)
      }
    },

    clearPlayerId() {
      this.playerId = null
      if (process.client) {
        localStorage.removeItem('playerId')
      }
    },

    loadPlayerId() {
      if (process.client) {
        const stored = localStorage.getItem('playerId')
        if (stored) {
          this.playerId = stored
        }
      }
    },

    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      if (process.client) {
        localStorage.setItem('theme', this.theme)
      }
    },

    loadTheme() {
      if (process.client) {
        const stored = localStorage.getItem('theme')
        if (stored === 'dark' || stored === 'light') {
          this.theme = stored
        }
      }
    },

    setPlayerCache(players: string[]) {
      this.playerCache = players
      this.playerCacheTimestamp = Date.now()
      if (process.client) {
        localStorage.setItem('playerCache', JSON.stringify(players))
        localStorage.setItem('playerCacheTimestamp', String(this.playerCacheTimestamp))
      }
    },

    loadPlayerCache() {
      if (process.client) {
        const cached = localStorage.getItem('playerCache')
        const timestamp = localStorage.getItem('playerCacheTimestamp')
        if (cached && timestamp) {
          this.playerCache = JSON.parse(cached)
          this.playerCacheTimestamp = Number(timestamp)
        }
      }
    },

    setMetaCache(meta: any) {
      this.metaCache = meta
      this.metaCacheTimestamp = Date.now()
    },

    setLastDbUpdate(timestamp: string) {
      this.lastDbUpdate = timestamp
    },

    setLastFetchTime() {
      this.lastFetchTime = Date.now()
    },

    setCooldown(seconds: number = 5) {
      this.cooldownUntil = Date.now() + seconds * 1000
    }
  }
})
