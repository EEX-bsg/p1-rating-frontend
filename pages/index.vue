<template>
    <v-container fluid class="fill-height">
        <v-row justify="center" align="center">
            <v-col cols="12" sm="8" md="6" lg="4">
                <v-card class="pa-6" elevation="2">
                    <v-card-title class="text-h5 text-center mb-4">
                        まつしげレーティング
                    </v-card-title>

                    <v-card-subtitle class="text-center mb-6">
                        プレイヤーIDを入力または選択してください
                    </v-card-subtitle>

                    <v-combobox v-model="selectedPlayer" :items="playerSuggestions" :loading="isLoadingSuggestions"
                        label="プレイヤーID" placeholder="名前を入力（新規も可）" clearable autofocus variant="outlined"
                        :hide-no-data="false" no-data-text="新しいプレイヤーとして登録されます"
                        @update:search="onSearchUpdate" @keydown.enter="handleSubmit" />

                    <div v-if="isNewPlayer" class="text-caption text-info mb-3">
                        「{{ selectedPlayer }}」は新規プレイヤーとして登録されます
                    </div>

                    <v-btn block color="primary" size="large" :disabled="!selectedPlayer || isSubmitting"
                        :loading="isSubmitting" @click="handleSubmit">
                        {{ isNewPlayer ? '登録して開始' : '決定' }}
                    </v-btn>

                    <v-divider class="my-4" />

                    <div class="text-caption text-center text-medium-emphasis">
                        <div v-if="lastDbUpdate">
                            DB最終更新: {{ formatTimestamp(lastDbUpdate) }}
                        </div>
                        <div v-if="lastFetchTime">
                            最終取得: {{ formatTimestamp(lastFetchTime) }}
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor">
            {{ snackbarText }}
        </v-snackbar>
    </v-container>
</template>

<script setup lang="ts">
import { useAppStore } from '~/stores/app'

const store = useAppStore()
const api = useApi()
const rating = useRating()
const router = useRouter()

const selectedPlayer = ref<string | null>(null)
const playerSuggestions = ref<string[]>([])
const isLoadingSuggestions = ref(false)
const isSubmitting = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('info')
const lastDbUpdate = computed(() => store.lastDbUpdate)
const lastFetchTime = computed(() => store.lastFetchTime ? new Date(store.lastFetchTime).toISOString() : null)

const isNewPlayer = computed(() => {
    if (!selectedPlayer.value || typeof selectedPlayer.value !== 'string') return false
    const trimmed = selectedPlayer.value.trim()
    if (!trimmed) return false
    return !store.playerCache.some(p => p === trimmed)
})

const formatTimestamp = (ts: string | number) => {
    const date = new Date(ts)
    return date.toLocaleString('ja-JP')
}

const showSnackbar = (text: string, color: string = 'info') => {
    snackbarText.value = text
    snackbarColor.value = color
    snackbar.value = true
}

const loadSuggestions = async () => {
    if (store.isCacheValid && store.playerCache.length > 0) {
        playerSuggestions.value = store.playerCache
        return
    }

    isLoadingSuggestions.value = true
    try {
        const result = await api.getSuggest('', 100)
        playerSuggestions.value = result.candidates || []
        store.setPlayerCache(playerSuggestions.value)
        store.setLastFetchTime()
    } catch (error) {
        console.error('Failed to load suggestions:', error)
    } finally {
        isLoadingSuggestions.value = false
    }
}

const onSearchUpdate = (value: string) => {
    // 既にキャッシュがあれば、それでフィルタリング
    if (store.playerCache.length > 0) {
        if (value) {
            playerSuggestions.value = store.playerCache.filter(p =>
                p.toLowerCase().includes(value.toLowerCase())
            )
        } else {
            playerSuggestions.value = store.playerCache
        }
    }
}

const handleSubmit = async () => {
    if (!selectedPlayer.value) return
    const playerName = selectedPlayer.value.trim()
    if (!playerName) return

    if (isNewPlayer.value) {
        isSubmitting.value = true
        try {
            const initial = rating.createInitialRating()
            await api.submitState(playerName, initial.mu, initial.sigma)
            // キャッシュに新規プレイヤーを追加
            store.setPlayerCache([...store.playerCache, playerName])
        } catch (error) {
            console.error('Failed to register player:', error)
            showSnackbar('プレイヤー登録に失敗しました', 'error')
            return
        } finally {
            isSubmitting.value = false
        }
    }

    store.setPlayerId(playerName)
    router.push('/main')
}

const fetchMeta = async () => {
    try {
        const meta = await api.getMeta()
        if (meta.lastUpdatedAt) {
            store.setLastDbUpdate(meta.lastUpdatedAt)
        }
    } catch (error) {
        console.error('Failed to fetch meta:', error)
    }
}

onMounted(() => {
    loadSuggestions()
    fetchMeta()
})
</script>
