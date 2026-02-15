<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="10" md="8" lg="6">
                <v-card class="pa-6" elevation="2">
                    <v-card-title class="text-h5 text-center">
                        {{ playerId }}
                    </v-card-title>

                    <v-divider class="my-4" />

                    <div v-if="isLoading" class="text-center py-8">
                        <v-progress-circular indeterminate color="primary" />
                    </div>

                    <div v-else-if="playerData">
                        <div class="text-center">
                            <div class="text-h3 font-weight-bold primary--text mb-2">
                                {{ displayRating }}
                            </div>
                            <div class="text-caption text-medium-emphasis mb-6">
                                Rating
                            </div>

                            <!-- 内部状態 (デバッグ用: dev toolsでdisplay:blockに変更して表示可能) -->
                            <div class="debug-internal-state" style="display: none !important;">
                                <v-expansion-panels variant="accordion" class="mb-4">
                                    <v-expansion-panel>
                                        <v-expansion-panel-title>
                                            内部状態を表示
                                        </v-expansion-panel-title>
                                        <v-expansion-panel-text>
                                            <div class="py-2">
                                                <div class="d-flex justify-space-between mb-2">
                                                    <span class="text-medium-emphasis">μ (mu):</span>
                                                    <span class="font-weight-medium">{{ playerData.mu.toFixed(3) }}</span>
                                                </div>
                                                <div class="d-flex justify-space-between">
                                                    <span class="text-medium-emphasis">σ (sigma):</span>
                                                    <span class="font-weight-medium">{{ playerData.sigma.toFixed(3)
                                                        }}</span>
                                                </div>
                                            </div>
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>
                                </v-expansion-panels>
                            </div>
                        </div>

                        <v-divider class="my-4" />

                        <div class="text-caption text-center text-medium-emphasis">
                            <div v-if="lastDbUpdate">
                                DB最終更新: {{ formatTimestamp(lastDbUpdate) }}
                            </div>
                            <div v-if="lastFetchTime">
                                最終取得: {{ formatTimestamp(lastFetchTime) }}
                            </div>
                        </div>
                    </div>

                    <div v-else class="text-center py-4 text-medium-emphasis">
                        データを読み込めませんでした
                    </div>

                    <v-divider class="my-4" />

                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <v-btn block color="primary" :disabled="!canRefresh || isLoading" @click="handleRefresh">
                                <v-icon left>mdi-refresh</v-icon>
                                更新
                            </v-btn>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-btn block color="secondary" to="/submit">
                                <v-icon left>mdi-pencil</v-icon>
                                試合結果入力
                            </v-btn>
                        </v-col>
                    </v-row>

                    <v-btn block variant="text" class="mt-2" @click="handleChangeId">
                        ID変更
                    </v-btn>
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

const playerId = computed(() => store.playerId)
const canRefresh = computed(() => store.canRefresh)
const lastDbUpdate = computed(() => store.lastDbUpdate)
const lastFetchTime = computed(() => store.lastFetchTime ? new Date(store.lastFetchTime).toISOString() : null)

const playerData = ref<any>(null)
const isLoading = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('info')

const displayRating = computed(() => {
    if (!playerData.value) return 0
    return rating.calculateDisplayRating(playerData.value.mu)
})

const formatTimestamp = (ts: string | number) => {
    const date = new Date(ts)
    return date.toLocaleString('ja-JP')
}

const loadPlayerData = async () => {
    if (!playerId.value) {
        router.push('/')
        return
    }

    isLoading.value = true
    try {
        const result = await api.getStates([playerId.value])

        if (result.items && result.items.length > 0) {
            playerData.value = result.items[0]
        } else {
            // 新規プレイヤー
            const initial = rating.createInitialRating()
            playerData.value = {
                name: playerId.value,
                mu: initial.mu,
                sigma: initial.sigma
            }
        }

        store.setLastFetchTime()
    } catch (error) {
        console.error('Failed to load player data:', error)
        showSnackbar('データの読み込みに失敗しました', 'error')
    } finally {
        isLoading.value = false
    }
}

const loadMeta = async () => {
    try {
        const meta = await api.getMeta()
        if (meta.lastUpdatedAt) {
            store.setLastDbUpdate(meta.lastUpdatedAt)
        }
    } catch (error) {
        console.error('Failed to load meta:', error)
    }
}

const handleRefresh = async () => {
    if (!canRefresh.value) {
        showSnackbar('しばらく待ってから再度お試しください', 'warning')
        return
    }

    await loadPlayerData()
    await loadMeta()
    store.setCooldown(5)
    showSnackbar('更新しました', 'success')
}

const handleChangeId = () => {
    store.clearPlayerId()
    router.push('/')
}

const showSnackbar = (text: string, color: string = 'info') => {
    snackbarText.value = text
    snackbarColor.value = color
    snackbar.value = true
}

onMounted(() => {
    if (!store.isPlayerSet) {
        router.push('/')
        return
    }

    loadPlayerData()
    loadMeta()
})
</script>
