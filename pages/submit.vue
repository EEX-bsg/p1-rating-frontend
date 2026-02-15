<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" md="10" lg="8">
                <v-card class="pa-6" elevation="2">
                    <v-card-title class="text-h5 text-center mb-4">
                        試合結果入力
                    </v-card-title>

                    <v-card-subtitle class="text-center mb-6">
                        参加者と順位を入力してください
                    </v-card-subtitle>

                    <!-- 参加者追加 -->
                    <v-card variant="outlined" class="mb-4 pa-4">
                        <v-card-subtitle class="px-0">参加者追加</v-card-subtitle>
                        <v-row dense>
                            <v-col cols="12" sm="9">
                                <v-autocomplete v-model="newParticipant" :items="playerSuggestions"
                                    :loading="isLoadingSuggestions" label="プレイヤーID" placeholder="名前を入力" clearable
                                    variant="outlined" density="comfortable" @update:search="onSearchUpdate" />
                            </v-col>
                            <v-col cols="12" sm="3">
                                <v-btn block color="primary" :disabled="!newParticipant || participants.length >= 10"
                                    @click="addParticipant">
                                    追加
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card>

                    <!-- 参加者リスト -->
                    <v-card variant="outlined" class="mb-4 pa-4">
                        <v-card-subtitle class="px-0 pb-2">
                            参加者リスト ({{ participants.length }}人)
                        </v-card-subtitle>

                        <v-list v-if="participants.length > 0" density="compact">
                            <v-list-item v-for="(participant, index) in participants" :key="index" class="px-2">
                                <template v-slot:prepend>
                                    <v-text-field v-model.number="participant.rank" type="number" label="順位"
                                        variant="outlined" density="compact" style="max-width: 80px" min="1"
                                        :max="participants.length" />
                                </template>

                                <v-list-item-title class="mx-4">
                                    {{ participant.name }}
                                </v-list-item-title>

                                <template v-slot:append>
                                    <v-btn icon size="small" variant="text" @click="removeParticipant(index)">
                                        <v-icon>mdi-close</v-icon>
                                    </v-btn>
                                </template>
                            </v-list-item>
                        </v-list>

                        <div v-else class="text-center text-medium-emphasis py-4">
                            参加者を追加してください
                        </div>
                    </v-card>

                    <!-- 実行ボタン -->
                    <v-row dense>
                        <v-col cols="12" sm="4">
                            <v-btn block color="primary" size="large" :disabled="!canSubmit || isCalculating"
                                :loading="isCalculating" @click="handleCalculateAndSubmit">
                                計算して保存
                            </v-btn>
                        </v-col>
                        <v-col cols="12" sm="4">
                            <v-btn block variant="outlined" size="large" :disabled="participants.length === 0"
                                @click="resetParticipants">
                                <v-icon left>mdi-delete-sweep</v-icon>
                                リセット
                            </v-btn>
                        </v-col>
                        <v-col cols="12" sm="4">
                            <v-btn block color="secondary" size="large" to="/main">
                                戻る
                            </v-btn>
                        </v-col>
                    </v-row>

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

                <!-- 結果表示ダイアログ -->
                <v-dialog v-model="showResultDialog" max-width="600" persistent>
                    <v-card>
                        <v-card-title class="text-h6">
                            計算結果
                        </v-card-title>

                        <v-card-text>
                            <v-list density="compact">
                                <v-list-item v-for="result in calculationResults" :key="result.name">
                                    <v-list-item-title>{{ result.name }}</v-list-item-title>
                                    <v-list-item-subtitle>
                                        {{ result.oldRating }} → {{ result.newRating }}
                                        <span :class="result.delta >= 0 ? 'text-success' : 'text-error'">
                                            ({{ result.delta >= 0 ? '+' : '' }}{{ result.delta }})
                                        </span>
                                    </v-list-item-subtitle>
                                </v-list-item>
                            </v-list>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer />
                            <v-btn color="primary" @click="closeResultDialog">
                                閉じる
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
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

const newParticipant = ref<string | null>(null)
const participants = ref<Array<{ name: string; rank: number }>>([])
const playerSuggestions = ref<string[]>([])
const isLoadingSuggestions = ref(false)
const isCalculating = ref(false)
const showResultDialog = ref(false)
const calculationResults = ref<any[]>([])

const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('info')

const lastDbUpdate = computed(() => store.lastDbUpdate)
const lastFetchTime = computed(() => store.lastFetchTime ? new Date(store.lastFetchTime).toISOString() : null)

const canSubmit = computed(() => {
    return participants.value.length >= 2 &&
        participants.value.every(p => p.rank >= 1)
})

const formatTimestamp = (ts: string | number) => {
    const date = new Date(ts)
    return date.toLocaleString('ja-JP')
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
    } catch (error) {
        console.error('Failed to load suggestions:', error)
    } finally {
        isLoadingSuggestions.value = false
    }
}

const onSearchUpdate = (value: string) => {
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

// 参加者リストをlocalStorageに自動保存
const persistParticipants = () => {
    if (process.client) {
        const names = participants.value.map(p => p.name)
        localStorage.setItem('savedParticipants', JSON.stringify(names))
    }
}

// 参加者リストをlocalStorageから復元
const restoreParticipants = () => {
    if (process.client) {
        const saved = localStorage.getItem('savedParticipants')
        if (saved) {
            const names = JSON.parse(saved)
            participants.value = names.map((name: string, index: number) => ({
                name,
                rank: index + 1
            }))
        }
    }
}

const addParticipant = () => {
    if (!newParticipant.value) return

    if (participants.value.some(p => p.name === newParticipant.value)) {
        showSnackbar('既に追加されています', 'warning')
        return
    }

    participants.value.push({
        name: newParticipant.value,
        rank: participants.value.length + 1
    })

    newParticipant.value = null
    persistParticipants()
}

const removeParticipant = (index: number) => {
    participants.value.splice(index, 1)
    // 順位を振り直し
    participants.value.forEach((p, i) => {
        if (p.rank > participants.value.length) {
            p.rank = i + 1
        }
    })
    persistParticipants()
}

const resetParticipants = () => {
    participants.value = []
    persistParticipants()
    showSnackbar('参加者リストをリセットしました', 'info')
}

const handleCalculateAndSubmit = async () => {
    if (!canSubmit.value) return

    isCalculating.value = true

    try {
        // 参加者の現在の状態を取得
        const names = participants.value.map(p => p.name)
        const statesResult = await api.getStates(names)

        // 参加者データを準備
        const playerStates = participants.value.map(p => {
            const existing = statesResult.items?.find((item: any) => item.name === p.name)
            if (existing) {
                return {
                    name: p.name,
                    mu: existing.mu,
                    sigma: existing.sigma
                }
            } else {
                // 新規プレイヤー
                const initial = rating.createInitialRating()
                return {
                    name: p.name,
                    mu: initial.mu,
                    sigma: initial.sigma
                }
            }
        })

        // 順位配列を作成 (0始まりに変換)
        const ranks = participants.value.map(p => p.rank - 1)

        // レーティング計算
        const results = rating.updateRatings(playerStates, ranks)
        calculationResults.value = results

        // 保存
        const playersToSave = results.map(r => ({
            name: r.name,
            mu: r.mu,
            sigma: r.sigma
        }))

        await api.submitStates(playersToSave, store.playerId || 'unknown')

        // メタ情報更新
        const meta = await api.getMeta()
        if (meta.lastUpdatedAt) {
            store.setLastDbUpdate(meta.lastUpdatedAt)
        }
        store.setLastFetchTime()

        showSnackbar('保存しました', 'success')
        showResultDialog.value = true

    } catch (error) {
        console.error('Failed to calculate and submit:', error)
        showSnackbar('保存に失敗しました', 'error')
    } finally {
        isCalculating.value = false
    }
}

const closeResultDialog = () => {
    showResultDialog.value = false
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

    restoreParticipants()
    loadSuggestions()
})
</script>
